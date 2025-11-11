# Sprint 1 - Setup Phase Complete

## Completed Tasks

### 1. ✅ Initialize React + TypeScript project with Vite

**Location:** `frontend/`

**What was done:**
- Created React application using Vite with TypeScript template
- Installed all base dependencies (192 packages)
- Configuration files automatically generated:
  - `vite.config.ts` - Vite build configuration
  - `tsconfig.json` - TypeScript configuration
  - `package.json` - Dependencies and scripts

**Verify:**
```bash
cd frontend
npm run dev
# Should start dev server on http://localhost:5173
```

---

### 2. ✅ Initialize Node.js (Express) + TypeScript backend

**Location:** `backend/`

**What was done:**
- Initialized Node.js project with `npm init`
- Created custom TypeScript configuration optimized for Node.js/Express
- Set up nodemon for automatic server restart during development
- Created entry point: `src/index.ts` with basic Express server
- Configured build scripts for TypeScript compilation

**Configuration Files:**
- `tsconfig.json` - TypeScript settings (ES2020, CommonJS, src→dist)
- `nodemon.json` - Watches for changes in `src/` folder
- `package.json` - Contains dev, build, and start scripts

**Verify:**
```bash
cd backend
npm run dev
# Server should start on http://localhost:3000
# Access http://localhost:3000/api/health
```

---

### 3. ✅ Initialize Git repository

**Location:** Root directory

**What was done:**
- Initialized Git repository in project root
- Created `.gitignore` files at three levels:
  - Root: General ignore rules
  - Backend: Node.js specific
  - Frontend: Vite/React specific (auto-generated)

**Key ignored items:**
- `node_modules/`
- `.env` files
- Build outputs (`dist/`, `build/`)
- IDE files (`.vscode/`, `.idea/`)

**Next steps:**
```bash
# Create first commit (optional)
git add .
git commit -m "Initial project setup - Sprint 1"
```

---

### 4. ✅ Create standardized folder structure

#### Backend Structure

```
backend/src/
├── config/          # Database connection, AWS SDK config
├── controllers/     # HTTP request handlers
├── middleware/      # Authentication, error handling
├── routes/          # API endpoint definitions
├── services/        # Business logic (database operations)
├── types/           # TypeScript interfaces
├── utils/           # Helper functions
└── index.ts         # Application entry point
```

#### Frontend Structure

```
frontend/src/
├── components/      # Reusable UI components
├── pages/           # Page-level components
├── services/        # API communication (axios)
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── types/           # TypeScript types/interfaces
├── utils/           # Utility functions
└── config/          # AWS Amplify configuration
```

---

### 5. ✅ Install backend dependencies

**Installed packages:**

**Production dependencies:**
```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "mysql2": "^3.15.3"
}
```

**Development dependencies:**
```json
{
  "typescript": "^5.9.3",
  "@types/node": "^24.10.0",
  "@types/express": "^5.0.5",
  "@types/cors": "^2.8.19",
  "ts-node": "^10.9.2",
  "nodemon": "^3.1.10"
}
```

**Purpose:**
- `express` - Web framework for building REST API
- `cors` - Enable cross-origin requests from frontend
- `dotenv` - Load environment variables from `.env` file
- `mysql2` - MySQL database driver (promise-based)
- `typescript` + types - TypeScript support
- `ts-node` - Execute TypeScript directly
- `nodemon` - Auto-restart server on file changes

---

### 6. ✅ Install frontend dependencies

**Installed packages:**

**Production dependencies:**
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.9.5",
  "axios": "^1.8.2",
  "aws-amplify": "^7.0.11"
}
```

**Development dependencies:**
```json
{
  "typescript": "^5.9.3",
  "vite": "^7.2.2",
  "@vitejs/plugin-react": "^5.1.0"
}
```

**Purpose:**
- `react` + `react-dom` - React library
- `react-router-dom` - Client-side routing (protected routes)
- `axios` - HTTP client for API calls
- `aws-amplify` - AWS Cognito authentication SDK
- `vite` - Fast build tool and dev server

---

## Project Files Created

### Configuration Files

1. **Backend:**
   - `backend/package.json` - Dependencies and scripts
   - `backend/tsconfig.json` - TypeScript compiler settings
   - `backend/nodemon.json` - Nodemon watch settings
   - `backend/.env.example` - Environment variable template
   - `backend/.gitignore` - Ignore patterns
   - `backend/src/index.ts` - Server entry point

2. **Frontend:**
   - `frontend/package.json` - Dependencies and scripts
   - `frontend/tsconfig.json` - TypeScript settings
   - `frontend/vite.config.ts` - Vite configuration
   - `frontend/.env.example` - Environment variable template
   - `frontend/.gitignore` - Ignore patterns (from template)

3. **Root:**
   - `.gitignore` - Root-level ignore patterns
   - `README.md` - Project documentation
   - `PROJECT_STRUCTURE.md` - Folder structure guide

### Documentation Files

- `README.md` - Complete project overview in English
- `PROJECT_STRUCTURE.md` - Detailed folder structure
- `docs/project_specification.md` - Vietnamese specification
- `docs/SPRINT_1_SETUP_COMPLETE.md` - This file

---

## Verification Steps

### 1. Test Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Server is running on port 3000
Environment: development
```

Test health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Mini DBaaS Portal API is running",
  "timestamp": "2025-11-11T..."
}
```

### 2. Test Frontend Dev Server

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v7.2.2  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Visit http://localhost:5173 to see the default Vite + React page.

### 3. Verify TypeScript Compilation

**Backend:**
```bash
cd backend
npm run build
# Should create dist/ folder with compiled JavaScript
ls dist/
```

**Frontend:**
```bash
cd frontend
npm run build
# Should create dist/ folder ready for deployment
ls dist/
```

---

## Environment Setup Required

### Backend Environment Variables

Create `backend/.env`:
```env
PORT=3000
NODE_ENV=development

# TODO: Add after AWS setup
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=app_manager

# TODO: Add after Cognito setup
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
AWS_REGION=us-east-1

FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api

# TODO: Add after Cognito setup
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_REGION=us-east-1
```

---

## Next Steps: Sprint 1 Continuation

### AWS Setup Tasks

1. **Create AWS Cognito User Pool**
   - Set up User Pool
   - Configure sign-up attributes (email)
   - Get User Pool ID and Client ID
   - Update `.env` files

2. **Create AWS RDS MySQL Instance**
   - Choose Free Tier configuration
   - Set master username and password
   - Configure security groups (allow your IP)
   - Get RDS endpoint
   - Update backend `.env`

### Backend Development Tasks

3. **Implement Authentication Middleware**
   - Install `aws-jwt-verify` or `jsonwebtoken`
   - Create `middleware/auth.ts`
   - Verify JWT tokens from Cognito
   - Extract user information (sub, email)

4. **Create Protected Routes**
   - Create `routes/auth.ts` (health, me)
   - Apply auth middleware
   - Test with Postman/curl

### Frontend Development Tasks

5. **Configure AWS Amplify**
   - Create `config/amplify.ts`
   - Configure Cognito settings
   - Initialize Amplify in `main.tsx`

6. **Create Authentication Pages**
   - `pages/Login.tsx`
   - `pages/Register.tsx`
   - `pages/ConfirmAccount.tsx`
   - `pages/Dashboard.tsx`

7. **Implement Routing**
   - Set up React Router
   - Create `ProtectedRoute` component
   - Define application routes

8. **Create Auth Context**
   - `contexts/AuthContext.tsx`
   - Store user state
   - Provide login/logout functions

---

## Development Workflow

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Dev server runs on http://localhost:5173
```

### Making Changes

1. **Backend changes:** Edit files in `backend/src/` - nodemon auto-restarts
2. **Frontend changes:** Edit files in `frontend/src/` - Vite hot-reloads
3. **Environment variables:** Restart servers after changing `.env` files

---

## Summary

All setup tasks for Sprint 1 are **COMPLETE**:

- ✅ React + TypeScript (Vite)
- ✅ Node.js + Express + TypeScript
- ✅ Git repository
- ✅ Folder structure
- ✅ Backend dependencies (Express, cors, dotenv, mysql2)
- ✅ Frontend dependencies (aws-amplify, react-router-dom, axios)

**Ready to proceed with:** AWS configuration and authentication implementation.

---

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

**Backend:** Change `PORT` in `.env`
**Frontend:** Vite will auto-increment to 5174, 5175, etc.

### TypeScript Errors

Ensure you're using compatible Node.js version (18.19.1 works with most packages).

For strict version requirements, consider updating Node.js to v20+.

### Module Not Found

Run `npm install` in the respective directory (backend or frontend).

---

**Setup Date:** November 11, 2025
**Status:** ✅ Complete
**Next Phase:** AWS Configuration & Authentication
