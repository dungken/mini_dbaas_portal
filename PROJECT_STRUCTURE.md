# Project Structure

## Overview

This document describes the folder structure and organization of the Mini DBaaS Portal project.

## Root Directory

```
mini_dbaas_portal/
├── backend/                 # Node.js + Express + TypeScript API
├── frontend/                # React + TypeScript + Vite
├── docs/                    # Project documentation
├── README.md                # Project overview and setup instructions
├── PROJECT_STRUCTURE.md     # This file
└── .gitignore              # Git ignore rules
```

## Backend Structure

```
backend/
├── src/
│   ├── config/             # Configuration files (database, AWS)
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware (auth, error handling)
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions
│   └── index.ts            # Application entry point
├── dist/                   # Compiled JavaScript (generated)
├── node_modules/           # Dependencies (generated)
├── .env.example            # Environment variables template
├── .gitignore              # Backend-specific ignore rules
├── nodemon.json            # Nodemon configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### Backend Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production code

## Frontend Structure

```
frontend/
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/              # Page components (Login, Register, Dashboard)
│   ├── services/           # API service functions
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript interfaces and types
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration (AWS Amplify)
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── dist/                   # Build output (generated)
├── node_modules/           # Dependencies (generated)
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── .gitignore              # Frontend-specific ignore rules
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

### Frontend Scripts

- `npm run dev` - Start development server (default: http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (RDS MySQL)
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your-master-password
DB_NAME=app_manager

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id
AWS_REGION=us-east-1

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
# Backend API Configuration
VITE_API_URL=http://localhost:3000/api

# AWS Cognito Configuration
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_COGNITO_REGION=us-east-1
```

## Tech Stack Summary

### Backend Dependencies

**Production:**
- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variable management
- `mysql2` - MySQL database driver

**Development:**
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `@types/express` - Express type definitions
- `@types/cors` - CORS type definitions
- `ts-node` - TypeScript execution engine
- `nodemon` - Development server with auto-reload

### Frontend Dependencies

**Production:**
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `aws-amplify` - AWS Cognito integration

**Development:**
- `typescript` - TypeScript compiler
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - React plugin for Vite

## Getting Started

### 1. Clone and Setup

```bash
# Navigate to project directory
cd mini_dbaas_portal

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install

# Frontend setup
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
npm install
```

### 2. Development

**Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

### 3. Build for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Output in dist/ folder ready for S3 deployment
```

## Next Steps (Sprint 1 Continuation)

1. Set up AWS Cognito User Pool
2. Set up AWS RDS MySQL instance
3. Implement authentication middleware in backend
4. Configure AWS Amplify in frontend
5. Create login, register, and confirm account pages
6. Implement protected routes

## Notes

- All backend TypeScript files are in `backend/src/`
- Compiled JavaScript outputs to `backend/dist/`
- Frontend uses Vite for fast HMR (Hot Module Replacement)
- Environment variables in frontend must be prefixed with `VITE_`
- Backend environment variables are loaded via `dotenv`
