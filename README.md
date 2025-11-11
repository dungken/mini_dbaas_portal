# Mini DBaaS Portal

A cloud-based Database as a Service (DBaaS) platform that automates MySQL database provisioning and management on AWS infrastructure.

## Overview

Mini DBaaS Portal is a self-service web application that allows users to provision and manage MySQL databases on-demand without manual database administration. Users can create isolated database instances with unique credentials, eliminating the need for direct server access or database expertise.

### What This Project IS

- A **Database Provisioning Service** - Automated creation and deletion of MySQL databases
- A **Self-Service Portal** - Users request databases through a web interface
- A **Cloud-Native Application** - Built on AWS managed services for scalability and reliability

### What This Project IS NOT

- **NOT a SQL Client** - This is not a replacement for tools like DBeaver, phpMyAdmin, or MySQL Workbench
- **NOT a Database GUI** - Users receive credentials to use with their preferred SQL client
- **NOT a Query Tool** - No built-in query execution or data browsing capabilities

## Key Features

- **User Authentication** - Secure sign-up and login using AWS Cognito
- **Database Provisioning** - One-click MySQL database creation
- **Credential Management** - Automatic generation of unique database credentials (host, port, username, password)
- **Database Inventory** - View all provisioned databases for your account
- **Resource Cleanup** - Delete databases when no longer needed
- **Security** - User isolation ensures databases are only accessible by their owners

## Architecture

### System Design

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│              AWS Cloud Infrastructure               │
│                                                     │
│  ┌──────────────┐         ┌──────────────┐          │
│  │  React App   │◄────────┤ AWS Cognito  │          │
│  │   (S3)       │         │  (Auth)      │          │
│  └──────┬───────┘         └──────────────┘          │
│         │                                           │
│         │ JWT Token                                 │
│         ▼                                           │
│  ┌──────────────┐         ┌──────────────┐          │
│  │   Node.js    │◄────────┤  MySQL RDS   │          │
│  │  Express API │         │  (Database)  │          │
│  │ (Elastic BS) │         └──────────────┘          │
│  └──────────────┘                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**
- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Authentication:** AWS Amplify SDK
- **Hosting:** AWS S3 (Static Website Hosting)

**Backend**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database Driver:** mysql2 (Promise-based)
- **Authentication:** AWS JWT Verify
- **Environment:** AWS Elastic Beanstalk
- **Additional:** CORS, dotenv

**Infrastructure (AWS Services)**
- **AWS Cognito** - User authentication and authorization
- **AWS RDS (MySQL)** - Managed database service
- **AWS S3** - Static website hosting for frontend
- **AWS Elastic Beanstalk** - PaaS for backend deployment

## Database Schema

### `provisioned_databases` Table

Stores metadata about all provisioned database instances.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `owner_id` | VARCHAR(255) | Cognito user ID (sub claim from JWT) |
| `db_name` | VARCHAR(100) | Unique database name (e.g., `user_db_1a2b3c`) |
| `db_user` | VARCHAR(100) | Database username (e.g., `user_1a2b3c`) |
| `created_at` | TIMESTAMP | Creation timestamp (default: CURRENT_TIMESTAMP) |

## API Endpoints

Base URL: `/api`

All endpoints except `/health` require JWT authentication via `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/health` | No | Health check endpoint |
| `GET` | `/me` | Yes | Get current user information from JWT |
| `POST` | `/databases/create` | Yes | Create a new database instance |
| `GET` | `/databases` | Yes | List all databases owned by the user |
| `DELETE` | `/databases/:db_name` | Yes | Delete a specific database |

### API Examples

**Create Database**
```bash
POST /api/databases/create
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "credentials": {
    "host": "xxx.rds.amazonaws.com",
    "port": 3306,
    "database": "user_db_a1b2c3",
    "username": "user_a1b2c3",
    "password": "randomly_generated_password"
  }
}
```

**List Databases**
```bash
GET /api/databases
Authorization: Bearer <jwt_token>

Response:
{
  "databases": [
    {
      "db_name": "user_db_a1b2c3",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

## Development Roadmap

### Sprint 1: Foundation & Authentication
- Set up AWS Cognito User Pool
- Configure AWS RDS MySQL instance
- Build Express backend with JWT authentication
- Create React frontend with login/register pages
- Implement protected routes

### Sprint 2: Core Features - Database Provisioning
- Implement database creation logic
- Generate random credentials
- Execute SQL commands (CREATE DATABASE, CREATE USER, GRANT)
- Display credentials in frontend modal
- Test with MySQL client tools

### Sprint 3: Management & Deployment
- Implement database listing endpoint
- Add delete functionality with owner verification
- Deploy frontend to S3
- Deploy backend to Elastic Beanstalk
- Configure production environment variables

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS Account with appropriate permissions
- MySQL client (DBeaver, MySQL Workbench) for testing

### Installation

**Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

**Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Configure AWS Cognito credentials
npm run dev
```

### Environment Variables

**Backend (.env)**
```
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-master-password
DB_PORT=3306
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id
AWS_REGION=us-east-1
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3000/api
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_COGNITO_REGION=us-east-1
```

## Usage Flow

1. **Sign Up** - Create an account through the registration page
2. **Confirm Email** - Verify your email address (Cognito sends verification code)
3. **Login** - Authenticate and receive JWT token
4. **Create Database** - Click "Create New Database" button
5. **Save Credentials** - Copy the database credentials (shown only once)
6. **Connect** - Use credentials in your preferred SQL client (DBeaver, Workbench, etc.)
7. **Manage** - View your databases list and delete when no longer needed

## Security Features

- **JWT Authentication** - All API requests require valid tokens
- **User Isolation** - Databases are tagged with owner_id, preventing unauthorized access
- **AWS Cognito** - Industry-standard authentication service
- **Input Validation** - Prevents SQL injection and malicious inputs
- **Unique Credentials** - Each database gets randomly generated passwords
- **Owner Verification** - Delete operations verify ownership before execution

## Deployment

### Frontend Deployment (S3)
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name
aws s3 website s3://your-bucket-name --index-document index.html
```

### Backend Deployment (Elastic Beanstalk)
```bash
cd backend
npm run build
zip -r app.zip dist/ package.json node_modules/
eb init -p node.js-18 mini-dbaas-backend
eb create production
eb setenv DB_HOST=xxx DB_PASSWORD=xxx ...
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of an educational assignment (Topic 8: Cloud-Based Database System).

## Acknowledgments

- Built as part of Cloud Computing coursework
- AWS Free Tier resources used for cost optimization
- Inspired by modern DBaaS platforms like AWS RDS, Google Cloud SQL, and PlanetScale

## Support

For issues, questions, or suggestions, please open an issue in the GitHub repository.
