# poridhi-infra
pulumi token: pul-bc07833b089d4845e4852f39bce30e3645f33a0d



Step 1: Install Pulumi and Configure AWS
SSH into the EC2 instance.
Install Pulumi:
bash
Copy code
curl -fsSL https://get.pulumi.com | sh
Verify the installation:
bash
Copy code
pulumi version
Configure AWS credentials (already set via AWS CLI):
bash
Copy code
export AWS_ACCESS_KEY_ID=<your-access-key>
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
export AWS_REGION=us-east-1
Step 2: Create a New Pulumi Project
Create a new directory and initialize Pulumi:
mkdir poridhi-infra && cd poridhi-infra
pulumi new aws-javascript
Modify the Pulumi.yaml file to name your project:
name: poridhi-infra
runtime: nodejs
Step 3: Install Required NPM Packages
Install necessary AWS libraries:

npm install @pulumi/aws @pulumi/awsx
Step 4: Write the Pulumi Code
Create or update the index.js file with the following code:

Step 5: Deploy the Pulumi Stack
Run the Pulumi stack:
bash
Copy code
pulumi up
Confirm and apply the changes.

Setup
1. Clone the Repository
bash
Copy code
git clone <repository-url>
cd <repository-folder>
2. Install Dependencies
Run the following command to install all necessary dependencies:

bash
Copy code
npm install
3. Configure Pulumi
Login to Pulumi and select a backend for state storage:

bash
Copy code
pulumi login
For Pulumi Cloud:
bash
Copy code
pulumi login
For local storage:
bash
Copy code
pulumi login --local
4. Initialize the Pulumi Project
Run the following command to initialize the Pulumi stack:

bash
Copy code
pulumi stack init dev
5. Set AWS Region
Set the AWS region for the stack:

bash
Copy code
pulumi config set aws:region us-east-1
6. Deploy the Stack
Deploy the infrastructure using:

bash
Copy code
pulumi up
Review the changes and confirm when prompted.

Resources Provisioned
1. VPC
Name: poridhi-test-vpc
CIDR Block: 10.0.0.0/16
Subnets:
LB Subnet 1: 10.0.1.0/24 (AZ: us-east-1a)
LB Subnet 2: 10.0.4.0/24 (AZ: us-east-1b)
FE Subnet: 10.0.2.0/24
BE Subnet: 10.0.3.0/24
2. Internet Gateway
Provides internet access for public subnets.
3. Security Groups
LB-SG: Allows traffic on ports 80 and 443 from anywhere.
FE-SG: Allows traffic from the ALB on port 80.
BE-SG: Allows traffic from the Frontend on port 4000.
4. EC2 Instances
Frontend instance in the FE Subnet.
Backend instance in the BE Subnet.
Instances are assigned public IPs for external access.
5. Application Load Balancer
Listens on port 80.
Routes traffic to:
Frontend TG: Default routing for /.
Backend TG: Path-based routing for /api/*.
How to Access
Frontend Application:
Access the frontend via the ALB DNS name:
arduino
Copy code
http://<alb-dns-name>
Backend Application:
API requests with path /api/* are forwarded to the backend.
Updating the Stack
To update the infrastructure, modify the Pulumi code and run:

bash
Copy code
pulumi up
Destroying the Stack
To tear down all provisioned resources:

bash
Copy code
pulumi destroy
Directory Structure
bash
Copy code
.
├── index.js               # Main Pulumi code for provisioning resources
├── package.json           # Node.js dependencies
├── node_modules/          # Installed dependencies
├── README.md              # Documentation
├── Pulumi.dev.yaml        # Pulumi configuration for the dev stack
└── Pulumi.yaml            # Pulumi project configuration


