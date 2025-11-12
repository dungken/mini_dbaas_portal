# CloudDB Manager Use Cases - Detailed Description

## 1. Authentication Package

### Register Account
**Primary Actor:** Any user (public)  
**Description:** Allows new users to create an account in the system.  
**Flow:**
1. User provides email, password, and basic profile information
2. System validates email uniqueness and password strength
3. System creates account with default Viewer role
4. Email verification is sent to the user

### Login
**Primary Actor:** All users (Viewer, Developer, Tenant Admin, Super Admin)  
**Description:** Authenticates existing users into the system.  
**Flow:**
1. User provides email/username and password
2. System validates credentials
3. System generates JWT token with appropriate role permissions
4. User is redirected to dashboard appropriate for their role

### Reset Password
**Primary Actor:** All users  
**Description:** Allows users to recover access when they forget their password.  
**Flow:**
1. User requests password reset via email
2. System sends time-limited reset link
3. User creates new password
4. System updates credentials and invalidates old sessions

### Manage Profile
**Primary Actor:** All users  
**Description:** Allows users to update their profile information.  
**Flow:**
1. User edits profile details (name, contact info, preferences)
2. User can change password (requires current password verification)
3. User can configure notification preferences

## 2. Database Instance Management

### Create DB Instance
**Primary Actor:** Developer, Tenant Admin, Super Admin  
**Description:** Creates a new MySQL database instance in the sandbox environment.  
**Flow:**
1. User specifies database name and optional configuration settings
2. System validates name uniqueness within tenant's scope
3. System creates isolated database schema in RDS-B
4. Connection details are stored in management database (RDS-A)
5. User is provided with connection information

**Constraints:**
- Database names must follow MySQL naming conventions
- Users are limited by tenant quota for number of databases
- Default size limits apply based on tenant plan

### Connect to DB Instance
**Primary Actor:** All users  
**Description:** Establishes connection to an existing database instance.  
**Flow:**
1. User selects database from available list
2. System validates access permissions
3. System establishes connection through connection pool
4. User is presented with database explorer interface

### Start/Stop DB Instance
**Primary Actor:** Developer, Tenant Admin, Super Admin  
**Description:** Controls the running state of a database instance.  
**Flow:**
1. User selects database and requests start/stop action
2. System validates permissions
3. System changes database state (may involve AWS RDS instance modifications)
4. Status is updated in management database

**Business Rules:**
- Stopped instances do not consume compute resources (but still count against storage quota)
- Auto-stop can be configured for instances idle beyond threshold

### Delete DB Instance
**Primary Actor:** Developer, Tenant Admin, Super Admin  
**Description:** Removes a database instance from the system.  
**Flow:**
1. User selects database and requests deletion
2. System requires confirmation with database name typed
3. System performs soft delete (30-day recovery window)
4. After 30 days, physical data is purged

**Alternative Flow:**
- Tenant Admin can perform immediate hard delete
- Super Admin can restore soft-deleted databases

## 3. Database Operations

### Browse Database Objects
**Primary Actor:** All users  
**Description:** Allows exploration of database schema and objects.  
**Flow:**
1. User navigates hierarchical tree view of database objects
2. User can expand categories (Tables, Views, Procedures, Functions)
3. User can view object metadata and properties
4. Search functionality allows finding objects by name or type

### View Table Data
**Primary Actor:** All users  
**Description:** Displays table contents with filtering and sorting.  
**Flow:**
1. User selects table from database explorer
2. System executes optimized SELECT query with pagination
3. Data is displayed in grid view with column headers
4. User can apply filters, sorting, and navigate between pages

**Includes:** Execute SELECT Query (for data retrieval)

### Execute SELECT Queries
**Primary Actor:** All users  
**Description:** Runs read-only SQL queries against database.  
**Flow:**
1. User enters SELECT query in query editor
2. System validates query is read-only
3. System executes query with timeout limit
4. Results are displayed in tabular format
5. Export options available for result sets

**Constraints:**
- Query timeout: 30 seconds (configurable by Tenant Admin)
- Maximum result set: 1000 rows (configurable)
- Query history is saved for later reference

### Execute DML Queries
**Primary Actor:** Developer, Tenant Admin, Super Admin  
**Description:** Runs data manipulation queries (INSERT, UPDATE, DELETE).  
**Flow:**
1. User enters DML query in query editor
2. System validates permissions
3. System executes query with appropriate transaction support
4. Affected row count is displayed
5. For large operations, background execution with status updates

**Extends:** Execute SELECT Queries (adds write capabilities)  
**Constraints:**
- Bulk operations limited by tenant's quota
- Transactional integrity enforced

### Execute DDL Queries
**Primary Actor:** Developer, Tenant Admin, Super Admin  
**Description:** Runs data definition queries (CREATE, ALTER, DROP).  
**Flow:**
1. User enters DDL query in query editor
2. System validates permissions and quotas
3. System executes query
4. Database explorer refreshes to show schema changes
5. DDL operations logged for audit

**Constraints:**
- Table count limited by tenant's quota
- Schema size limitations apply
- Certain operations may require Tenant Admin approval

### Modify Table Structure
**Primary Actor:** Developer, Tenant Admin, Super Admin  
**Description:** Provides visual interface for table structure changes.  
**Flow:**
1. User selects table and accesses structure editor
2. System displays columns, indices, and constraints
3. User makes changes through form interface
4. System generates and executes appropriate ALTER TABLE statements
5. Changes are validated for data integrity

## 4. User Management

### Invite Users
**Primary Actor:** Tenant Admin, Super Admin  
**Description:** Adds new users to a tenant organization.  
**Flow:**
1. Admin enters email addresses and selects initial role
2. System sends invitation emails with temporary access links
3. Recipients complete registration process
4. New accounts are created with specified roles within tenant

**Constraints:**
- User count limited by tenant's quota
- Role assignment restricted to roles equal or lower than admin's own role

### Manage User Roles
**Primary Actor:** Tenant Admin, Super Admin  
**Description:** Controls access permissions for existing users.  
**Flow:**
1. Admin views list of users in tenant
2. Admin selects user and modifies role
3. System updates permissions immediately
4. Affected user's active sessions are updated or invalidated

**Includes:** Set Resource Quotas (for individual user limits)  
**Constraints:**
- Cannot elevate users to roles higher than admin's own role
- Super Admin accounts must always have at least one active user

### Deactivate User
**Primary Actor:** Tenant Admin, Super Admin  
**Description:** Temporarily or permanently removes user access.  
**Flow:**
1. Admin selects user and initiates deactivation
2. System prompts for deactivation reason and duration
3. User sessions are invalidated immediately
4. User status is changed to inactive

**Alternative Flow:**
- Temporary deactivation includes automatic reactivation date
- Permanent deactivation retains user data but prevents login

## 5. Administration

### Manage Tenants
**Primary Actor:** Super Admin  
**Description:** Creates and configures tenant organizations.  
**Flow:**
1. Admin creates new tenant with name and description
2. Admin assigns initial resource quotas and plan
3. Admin creates first Tenant Admin user
4. System provisions isolated tenant resources in sandbox database

**Constraints:**
- Tenant naming follows system conventions
- Initial setup includes basic database template options

### Set Resource Quotas
**Primary Actor:** Super Admin (tenant level), Tenant Admin (user level)  
**Description:** Defines resource usage limits.  
**Flow:**
1. Admin selects tenant or user
2. Admin configures quotas (database count, storage, compute)
3. System applies limits immediately
4. Monitoring alerts are configured for quota thresholds

**Constraints:**
- Super Admin sets tenant-level quotas
- Tenant Admin distributes allocation among users
- Exceeding quotas triggers alerts and optional restrictions

### View System Metrics
**Primary Actor:** Tenant Admin, Super Admin  
**Description:** Provides monitoring dashboard for system performance.  
**Flow:**
1. Admin accesses monitoring dashboard
2. System displays real-time and historical metrics
3. Metrics include database performance, storage usage, query statistics
4. Filtering options available for specific resources or time periods

**Constraints:**
- Tenant Admins see only their tenant's metrics
- Super Admin sees system-wide and tenant-specific metrics

### Configure System Settings
**Primary Actor:** Super Admin  
**Description:** Controls global system configuration.  
**Flow:**
1. Admin accesses system settings interface
2. Admin modifies configuration parameters
3. Changes are validated and applied
4. System services may restart if required

**Settings include:**
- Security policies (password requirements, session timeouts)
- Default quotas and limitations
- Email notification settings
- Background job scheduling
- Backup and maintenance policies

## Cross-Cutting Concerns

### Audit Logging
All significant actions in the system are logged with:
- Timestamp
- User identity
- Action details
- Affected resources
- IP address and session information

Logs are retained according to configurable retention policy and accessible to appropriate administrators.

### Error Handling
All use cases include appropriate error handling:
- Validation errors return specific feedback
- System errors are logged with diagnostic information
- User-friendly error messages display appropriate detail level based on user role
- Critical errors trigger notifications to administrators

### Performance Monitoring
Database operations include performance tracking:
- Query execution time
- Resource utilization
- Result set size
- Connection pool statistics

This information feeds into the monitoring dashboard and helps identify optimization opportunities.