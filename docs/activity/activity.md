# CloudDB Manager - Detailed Business Workflow Description

## 1. Authentication and Access Management Workflow

### Business Purpose
The authentication workflow establishes secure user identity verification and controls access to system resources based on assigned roles, ensuring data security and proper resource isolation in a multi-tenant environment.

### Detailed Process

#### Initial Access and Registration
1. **System Entry Point**: User navigates to CloudDB Manager URL
2. **Authentication Determination**:
   - System checks for existing session token
   - If no valid token exists, user is presented with login/register options
3. **New User Registration**:
   - User provides email address, password, and basic profile information
   - System validates email format and password strength requirements:
     * Passwords require minimum 8 characters with mixed case, numbers, and symbols
     * Email must be properly formatted and not previously registered
   - System creates user account with default "Viewer" role
   - Verification email is sent containing a time-limited activation link (24-hour validity)
   - User must verify email before gaining full system access
   - Upon verification, user is directed to onboarding process

#### Authentication Process
1. **Credential Submission**:
   - User enters email/username and password
   - Optional: Two-factor authentication if enabled
2. **Credential Validation**:
   - System validates credentials against stored BCrypt hash
   - Failed attempts are rate-limited (5 attempts before temporary lockout)
   - Successful validation generates a JWT token containing:
     * User identifier
     * Role information
     * Tenant context
     * Token expiration (default: 12 hours)
3. **Session Establishment**:
   - JWT token is returned to client
   - Client stores token in secure storage (HTTP-only cookie or local storage)
   - Subsequent API requests include token in Authorization header

#### Role-Based Access Control
1. **Permission Context**:
   - Upon successful authentication, system loads role-specific permissions
   - UI adapts to show only authorized functions
   - Backend validates permissions for each API request
2. **Session Management**:
   - Inactivity timeout (30 minutes default, configurable)
   - Token refresh mechanism for extended sessions
   - Explicit logout invalidates token

### Business Rules
- One email address can be associated with multiple tenants but requires separate login sessions
- Password reset requires email verification and cannot reuse recent passwords
- Failed login attempts are logged with IP information for security monitoring
- Super Admins can force password resets for security purposes
- Tenant context is established at login and maintained throughout the session

## 2. Database Management Workflow

### Business Purpose
This workflow enables users to provision, configure, and manage isolated database environments within their resource allocation limits, providing a self-service platform for database operations.

### Detailed Process

#### Database Creation
1. **Initiation**:
   - User selects "Create Database" from dashboard
   - System presents configuration form
2. **Configuration Options**:
   - Database name (must be unique within tenant)
   - Character set and collation settings
   - Optional template selection (blank, sample data, specific schema)
   - Advanced configuration options (for Developer+ roles)
3. **Resource Validation**:
   - System checks tenant's database quota (based on subscription plan)
   - Validates remaining allocation for the user
   - Presents confirmation with resource impact
4. **Provisioning Process**:
   - System creates isolated schema in Sandbox RDS (RDS-B)
   - Sets up user-specific access credentials
   - Creates connection record in Management RDS (RDS-A)
   - Performs initial configuration based on template selection
5. **Completion**:
   - Connection details are presented to user
   - Database appears in user's connection list
   - System logs creation event for audit purposes

#### Database Connection
1. **Connection Initiation**:
   - User selects database from available connections
   - System retrieves connection metadata from Management DB
2. **Connection Establishment**:
   - System allocates connection from pool or creates new connection
   - Authentication occurs using tenant-specific credentials
   - Connection is assigned to user session
3. **Interaction Ready State**:
   - Database explorer loads schema information
   - Recent query history is retrieved
   - System monitors connection for activity

#### Database Management Operations
1. **Status Control**:
   - Start/Stop operations affect resource consumption
   - Stopped databases maintain storage but release compute resources
   - Auto-stop feature activates after configurable idle period (default: 1 hour)
2. **Deletion Process**:
   - User initiates deletion request
   - Confirmation requires typing database name
   - System performs soft delete (30-day recovery window)
   - Resources are immediately freed from quota
   - After retention period, background job performs physical deletion

### Business Rules
- Database names must follow MySQL naming conventions (alphanumeric, underscore, maximum 64 characters)
- Tenant quotas enforce limits on:
  * Number of databases (based on subscription tier)
  * Total storage allocation
  * Concurrent connections
- Resource accounting occurs at tenant level with optional sub-allocation to users
- Database operations are subject to role permissions:
  * Viewers: Connect and query only
  * Developers: Create, modify, delete
  * Tenant Admins: All operations plus user assignment

## 3. Query Execution Workflow (Core Functionality)

### Business Purpose
This workflow represents the primary interaction mode for users, allowing execution of SQL queries against database instances with appropriate security controls and result management, providing database functionality through a web browser.

### Detailed Process

#### Query Development
1. **Editor Access**:
   - User selects connected database
   - System presents query editor interface with:
     * Syntax highlighting for SQL
     * Code completion suggestions
     * Schema browser panel
     * Query history access
2. **Query Composition**:
   - User writes or pastes SQL query
   - System provides real-time syntax validation
   - Optional: Query optimization suggestions
3. **Execution Request**:
   - User submits query for execution
   - System captures execution context (database, user, timestamp)

#### Query Processing
1. **Query Analysis**:
   - System parses query to identify type:
     * SELECT/SHOW: Read-only operations
     * INSERT/UPDATE/DELETE: Data Manipulation Language (DML)
     * CREATE/ALTER/DROP: Data Definition Language (DDL)
2. **Permission Validation**:
   - Read-only operations: All roles permitted
   - DML operations: Developer+ roles required
   - DDL operations: Developer+ roles required with possible restrictions
3. **Resource Constraint Application**:
   - Query timeout limits applied (30 seconds default, configurable)
   - Result set size limits applied (1000 rows default, configurable)
   - Transaction size limits for bulk operations
4. **Execution Path Selection**:
   - READ queries route directly to database
   - WRITE queries include additional validation:
     * Schema modification restrictions
     * Size/impact estimation
     * Quota implications

#### Result Handling
1. **Success Path**:
   - System formats result set for display
   - Tabular data presented with column headers
   - Statistics provided (execution time, row count, affected rows)
   - Results can be paginated if large
2. **Export Options**:
   - CSV, JSON, SQL INSERT format
   - Download or clipboard copy
   - Result set archiving (for paid tiers)
3. **Error Path**:
   - Error messages translated to user-friendly format
   - Syntax errors include position indicators
   - Reference information provided for common errors
   - Query history marks failed queries for reference

### Business Rules
- Query timeouts prevent resource monopolization
- Result set size limits prevent memory overload
- DDL operations may require confirmation for impactful changes
- Query history is retained for user reference (last 100 queries)
- Rate limiting applies for high-frequency operations
- Certain operations may be restricted based on tenant configuration:
  * Procedure/function creation
  * Foreign key constraints
  * High-impact table alterations

## 4. User Management Workflow

### Business Purpose
This administrative workflow enables tenant administrators to control access, assign roles, and manage resource allocation within their organization, maintaining proper governance and security over database resources.

### Detailed Process

#### User Invitation
1. **Invitation Initiation**:
   - Tenant Admin accesses User Management interface
   - Selects "Invite Users" function
   - Enters email addresses (single or batch)
   - Assigns initial role (Viewer, Developer)
   - Adds optional welcome message
2. **Invitation Processing**:
   - System validates email formats
   - Checks against user quota for tenant
   - Creates pending invitation records
   - Generates unique invitation links with expiration (7 days)
3. **Communication**:
   - System sends branded invitation emails
   - Emails contain secure one-time links
   - Invitees complete registration through link
4. **Activation**:
   - New users complete profile information
   - System activates account with assigned role
   - Tenant Admin is notified of completed registrations

#### Role Management
1. **User Selection**:
   - Admin views list of active users
   - Filtering options by role, activity, resource usage
   - Selects target user for modification
2. **Role Assignment**:
   - Current permissions displayed
   - Available roles shown based on Admin's own level
   - Admin selects new role
   - System presents impact assessment (resource changes)
3. **Permission Application**:
   - System updates user's role assignment
   - Recalculates effective permissions
   - Active user sessions are flagged for refresh or invalidation
   - Audit log records role change with timestamp and admin identity

#### Resource Allocation
1. **Usage Assessment**:
   - Admin views tenant-wide resource dashboard
   - Current usage metrics displayed:
     * Database count (used/available)
     * Storage allocation (used/available)
     * Connection utilization (active/limit)
     * Query execution statistics
2. **Quota Management**:
   - Admin can allocate sub-quotas to users
   - System enforces tenant-level maximum
   - Adjustments apply immediately to new operations
   - Existing resources remain unaffected

#### User Deactivation
1. **Deactivation Process**:
   - Admin selects user and initiates deactivation
   - Reason is recorded (voluntary departure, security, inactivity)
   - Deactivation type selected (temporary/permanent)
   - For temporary, reactivation date is specified
2. **Resource Handling**:
   - System presents resource ownership summary
   - Options to reassign, archive, or delete user resources
   - Databases owned by deactivated user can be transferred
3. **Security Actions**:
   - Active sessions immediately terminated
   - Access tokens invalidated
   - API keys revoked
   - User status changed to inactive

### Business Rules
- User count limitations based on tenant subscription plan
- Role hierarchy enforced (admins can only manage users at or below their level)
- Last Tenant Admin cannot be deactivated to prevent orphaned tenants
- Resource ownership transfers require explicit reassignment
- Deactivation includes configurable grace period for reactivation
- Super Admins can override tenant-level user management decisions

## 5. Monitoring and Metrics Workflow

### Business Purpose
This workflow provides visibility into system performance, resource utilization, and user activity, enabling data-driven decisions about resource allocation and system optimization.

### Detailed Process

#### Dashboard Access
1. **Contextual Display**:
   - Super Admin: System-wide metrics across all tenants
   - Tenant Admin: Tenant-specific metrics across users
   - Developer: Personal usage metrics
   - Viewer: Basic status information only
2. **Time Period Selection**:
   - Real-time display (last 15 minutes)
   - Historical data (day, week, month, custom range)
   - Comparison mode (current vs. previous period)

#### Metric Categories
1. **Performance Metrics**:
   - Query execution times (average, percentiles)
   - Connection pool utilization
   - Resource-intensive operations tracking
   - Response time trends
2. **Resource Utilization**:
   - Database count and growth trends
   - Storage usage (total and per-database)
   - Connection concurrency patterns
   - Query throughput
3. **User Activity**:
   - Active user sessions
   - Query patterns by user
   - Resource creation/modification events
   - Login/logout patterns

#### Alert Configuration
1. **Threshold Setting**:
   - Tenant Admins can configure alert thresholds
   - Percentage-based or absolute value triggers
   - Notification methods (in-app, email)
2. **Alert Conditions**:
   - Quota approach (80%, 90%, 100%)
   - Performance degradation
   - Error rate increases
   - Security-related events

### Business Rules
- Metric retention varies by type:
  * Performance data: 30 days
  * Resource utilization: 90 days
  * User activity: 90 days
  * Aggregated historical data: 1 year
- Data granularity decreases with age (minute → hour → day)
- Export functionality for compliance reporting
- Alert frequency controls prevent notification storms
- Certain metrics visible only to appropriate roles

## Integration Points Between Workflows

1. **Authentication ↔ Database Management**:
   - User identity and permissions determine available database operations
   - Tenant context established at login isolates database visibility

2. **Database Management ↔ Query Execution**:
   - Database provisioning creates the environment for query execution
   - Connection pool maintains efficient database access
   - Database state (running/stopped) affects query availability

3. **User Management ↔ Authentication**:
   - Role assignments in user management affect permission context in authentication
   - User deactivation triggers session termination

4. **Monitoring ↔ All Workflows**:
   - All operations generate metrics for monitoring
   - Resource utilization affects available operations
   - Performance insights guide system optimization

These integrated workflows form the comprehensive business process model for the CloudDB Manager system, balancing functionality, security, and resource management in a multi-tenant cloud environment.