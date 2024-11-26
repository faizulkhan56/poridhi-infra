const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

// VPC with public subnets
// Create a VPC
const vpc = new aws.ec2.Vpc("poridhi-test-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsSupport: true,
    enableDnsHostnames: true,
    tags: { Name: "poridhi-test-vpc" },
});

// Create an Internet Gateway
const internetGateway = new aws.ec2.InternetGateway("poridhi-internet-gateway", {
    vpcId: vpc.id,
    tags: { Name: "poridhi-internet-gateway" },
});

// Create a Route Table for public subnets
const publicRouteTable = new aws.ec2.RouteTable("poridhi-public-route-table", {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        },
    ],
    tags: { Name: "poridhi-public-route-table" },
});

// Create Subnets for LB, FE, and BE
const lbSubnet = new aws.ec2.Subnet("poridhi-test-lb-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    mapPublicIpOnLaunch: true,
    availabilityZone: "us-east-1a",
    tags: { Name: "poridhi-test-lb-subnet" },
});

const lbSubnet2 = new aws.ec2.Subnet("poridhi-test-lb-subnet-2", {
    vpcId: vpc.id,
    cidrBlock: "10.0.4.0/24",
    mapPublicIpOnLaunch: true,
    availabilityZone: "us-east-1b",
    tags: { Name: "poridhi-test-lb-subnet-2" },
});

const feSubnet = new aws.ec2.Subnet("poridhi-test-fe-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.2.0/24",
    mapPublicIpOnLaunch: true,
    tags: { Name: "poridhi-test-fe-subnet" },
});

const beSubnet = new aws.ec2.Subnet("poridhi-test-be-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.3.0/24",
    mapPublicIpOnLaunch: true,
    tags: { Name: "poridhi-test-be-subnet" },
});

// Associate the Route Table with each subnet
new aws.ec2.RouteTableAssociation("lb-subnet-association", {
    subnetId: lbSubnet.id,
    routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation("lb-subnet-2-association", {
    subnetId: lbSubnet2.id,
    routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation("fe-subnet-association", {
    subnetId: feSubnet.id,
    routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation("be-subnet-association", {
    subnetId: beSubnet.id,
    routeTableId: publicRouteTable.id,
});


// Security Groups
const lbSg = new aws.ec2.SecurityGroup("poridhi-sg-lb", {
    vpcId: vpc.id,
    ingress: [
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    tags: { Name: "poridhi-sg-lb" },
});

const feSg = new aws.ec2.SecurityGroup("poridhi-sg-fe", {
    vpcId: vpc.id,
    ingress: [{ protocol: "tcp", fromPort: 80, toPort: 80, securityGroups: [lbSg.id] }],
    egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    tags: { Name: "poridhi-sg-fe" },
});

const beSg = new aws.ec2.SecurityGroup("poridhi-sg-be", {
    vpcId: vpc.id,
    ingress: [{ protocol: "tcp", fromPort: 4000, toPort: 4000, securityGroups: [feSg.id] }],
    egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    tags: { Name: "poridhi-sg-be" },
});

// EC2 Instances
const feInstance = new aws.ec2.Instance("poridhi-fe-instance", {
    ami: "ami-0c02fb55956c7d316", // Replace with the latest Ubuntu AMI ID for your region
    instanceType: "t2.micro",
    subnetId: feSubnet.id,
    associatePublicIpAddress: true,
    keyName: "n-training",
    securityGroupIds: [feSg.id], // Use the ID of the security group, not the name
    tags: { Name: "poridhi-fe-instance" },
});

const beInstance = new aws.ec2.Instance("poridhi-be-instance", {
    ami: "ami-0c02fb55956c7d316",
    instanceType: "t2.micro",
    subnetId: beSubnet.id,
    associatePublicIpAddress: true,
    keyName: "n-training",
    securityGroupIds: [beSg.id], // Use the ID of the security group, not the name
    tags: { Name: "poridhi-be-instance" },
});

// Application Load Balancer (ALB)
const alb = new aws.lb.LoadBalancer("poridhi-lb", {
    internal: false,
    securityGroups: [lbSg.id],
    subnets: [lbSubnet.id,lbSubnet2.id],
    tags: { Name: "poridhi-lb" },
});

// Target Groups
const feTg = new aws.lb.TargetGroup("poridhi-fe-tg", {
    port: 80,
    protocol: "HTTP",
    vpcId: vpc.id,
    healthCheck: { path: "/", protocol: "HTTP" },
    tags: { Name: "poridhi-fe-tg" },
});

const beTg = new aws.lb.TargetGroup("poridhi-be-tg", {
    port: 4000,
    protocol: "HTTP",
    vpcId: vpc.id,
    healthCheck: { path: "/", protocol: "HTTP" },
    tags: { Name: "poridhi-be-tg" },
});

// Listener for ALB
const listener = new aws.lb.Listener("poridhi-lb-listener", {
    loadBalancerArn: alb.arn,
    port: 80,
    protocol: "HTTP",
    defaultActions: [
        {
            type: "forward",
            targetGroupArn: feTg.arn,
        },
    ],
    tags: { Name: "poridhi-lb-listener" },
});

// Path-Based Listener Rule

new aws.lb.ListenerRule("poridhi-lb-path-rule", {
    listenerArn: listener.arn,
    conditions: [
        {
            pathPattern: {
                values: ["/api/*", "/api"]
            }
        }
    ],
    actions: [
        {
            type: "forward",
            targetGroupArn: beTg.arn
        }
    ],
    priority: 1
});

