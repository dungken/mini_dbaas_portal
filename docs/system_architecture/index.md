# CloudDB Manager System Architecture - Detailed Description

## Overview

The CloudDB Manager employs a modern, cloud-native architecture designed for security, scalability, and maintainability. This multi-tier system separates concerns between user interface, application logic, and data storage through a dual-database approach that isolates system management from user sandbox environments.

## Architectural Components

### 1. Frontend Layer (React TypeScript)

The user interface consists of six primary modules:

- **Authentication**: Provides login, registration, and account recovery interfaces, integrated with JWT-based authentication
- **Query Editor**: Rich text editor with SQL syntax highlighting, query execution controls, and results display
- **DB Explorer**: Tree-view navigator for database objects (tables, views, stored procedures) with metadata display
- **Table Viewer**: Grid-based interface for viewing, filtering, and modifying table data
- **User Management**: Interface for creating and managing user accounts and permissions
- **Admin Dashboard**: System monitoring, tenant management, and configuration interfaces

The frontend communicates exclusively with the backend services via REST APIs, with all sensitive operations secured through JWT tokens.

### 2. Backend Layer (Node.js TypeScript)

The application logic is organized into specialized services:

- **Auth Service**: Handles user authentication through JWT token generation/validation and password security with BCrypt hashing
- **DB Service**: Manages database instance operations (create, connect, start/stop, delete)
- **Query Service**: Processes and executes SQL queries with appropriate security checks
- **User Service**: Manages user accounts, profiles, and permissions
- **Admin Service**: Handles system-wide administrative functions
- **Connection Pool**: Central component that efficiently manages database connections to user sandbox environments

This service-oriented approach allows for:
- Independent scaling of components based on demand
- Isolated testing and deployment
- Clear separation of responsibilities

### 3. AWS Cloud Infrastructure

The cloud environment consists of:

- **EC2 Server**: Hosts the Node.js runtime environment that executes all backend services
- **RDS-A (Management Database)**: MySQL database storing all system-critical information:
  - User accounts and authentication data
  - Tenant configuration and billing information
  - System settings and connection metadata
  - Usage metrics and audit logs

- **RDS-B (Sandbox Database)**: MySQL instance hosting isolated tenant databases:
  - Each tenant gets a dedicated database schema
  - Complete isolation between tenant environments
  - Sandboxed execution environment for user queries

## Key Architectural Patterns

### 1. Dual-Database Separation

The dual-database architecture is a cornerstone of the system's security model:

- **Complete Isolation**: System management data (users, configurations) is entirely separate from user sandbox databases
- **Security Boundary**: Prevents potential SQL injection attacks in user environments from affecting system data
- **Performance Isolation**: Resource-intensive queries in sandbox environments cannot impact system operations
- **Independent Scaling**: Each database can be scaled according to its specific workload characteristics

### 2. Connection Pooling

The Connection Pool service:
- Manages efficient database connections to minimize resource usage
- Enforces connection limits per tenant
- Provides connection caching for improved performance
- Handles graceful timeout and reconnection logic
- Enables monitoring of connection metrics

### 3. Multi-Tenant Architecture

The system implements a robust multi-tenant model where:
- Each tenant is logically isolated at the database level
- Resource quotas can be enforced per tenant
- Operations are secured through role-based permissions
- Tenant-specific configurations can be applied

## Data Flow

1. Users interact with the frontend components in their browser
2. Frontend components make authenticated API calls to corresponding backend services
3. Backend services validate permissions through the Auth Service
4. Database operations on system data are routed directly to RDS-A
5. User query operations flow through:
   - Query Service → Connection Pool → RDS-B (Sandbox)
6. Results are returned through the same path in reverse

## Security Considerations

- **JWT Authentication**: Secure, stateless authentication with configurable expiration
- **BCrypt Password Hashing**: Industry-standard password security
- **Service Isolation**: Backend services have limited, specific access to databases
- **Database Separation**: System and user data completely isolated
- **Role-Based Access**: Granular permissions based on user roles

## Scalability Aspects

The architecture supports horizontal and vertical scaling:
- Frontend can be distributed behind a load balancer
- Backend services can be containerized and scaled independently
- Database instances can be scaled based on workload requirements
- Connection pooling optimizes resource usage as user numbers grow

This architecture provides a solid foundation for the 3-week MVP while establishing patterns that will support future growth and feature expansion, balancing immediate deliverability with long-term scalability.