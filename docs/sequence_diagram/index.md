# CloudDB Manager - Core Query Execution Sequence Diagram

Here's a detailed sequence diagram illustrating the core query execution flow, which represents the central functionality of the CloudDB Manager system:

```plantuml
@startuml CloudDB Manager Query Execution

' Style settings
skinparam backgroundColor white
skinparam defaultFontName Arial
skinparam sequenceArrowThickness 2
skinparam sequenceGroupBorderThickness 2
skinparam sequenceGroupBodyBackgroundColor #EEEEEE
skinparam sequenceGroupBorderColor #666666
skinparam noteBackgroundColor #FFFACD
skinparam noteBorderColor #999999

' Participants
actor "User" as User
boundary "Query Editor\n(React)" as QueryEditor
control "API Gateway" as APIGateway
participant "Authentication\nService" as AuthService
participant "Query\nService" as QueryService
participant "Database\nService" as DBService
participant "Connection\nPool" as ConnPool
database "RDS-A\n(Management DB)" as RDSA
database "RDS-B\n(Sandbox DB)" as RDSB

' Sequence
User -> QueryEditor: Input SQL query
activate QueryEditor

QueryEditor -> QueryEditor: Local validation/syntax highlighting
QueryEditor -> APIGateway: POST /api/queries/execute\n{instanceId, queryText}
activate APIGateway

APIGateway -> AuthService: Validate JWT token
activate AuthService
AuthService -> RDSA: Verify token & user permissions
RDSA --> AuthService: Return user context
AuthService --> APIGateway: Token valid, roles: [Developer]
deactivate AuthService

APIGateway -> QueryService: Forward request
activate QueryService

QueryService -> QueryService: Parse query type\n(SELECT/DML/DDL)

alt Query type = SELECT
    QueryService -> QueryService: Validate read permissions
else Query type = DML (INSERT/UPDATE/DELETE)
    QueryService -> QueryService: Validate write permissions
else Query type = DDL (CREATE/ALTER/DROP)
    QueryService -> QueryService: Validate schema modify permissions
end

QueryService -> DBService: Get database connection\n(instanceId)
activate DBService

DBService -> RDSA: Fetch connection metadata
activate RDSA
RDSA --> DBService: Return {host, credentials, schema}
deactivate RDSA

DBService -> ConnPool: Acquire connection
activate ConnPool
ConnPool -> ConnPool: Check for existing connection
ConnPool -> RDSB: Connect if needed\n(tenant-specific credentials)
activate RDSB
RDSB --> ConnPool: Connection established
deactivate RDSB

ConnPool --> DBService: Return connection
deactivate ConnPool

DBService --> QueryService: Connection ready
deactivate DBService

QueryService -> ConnPool: Execute query(connection, queryText)
activate ConnPool
ConnPool -> RDSB: Execute SQL with timeout
activate RDSB

alt Successful execution
    RDSB --> ConnPool: Return results/affected rows
    ConnPool --> QueryService: Query results
    
    QueryService -> RDSA: Log query execution\n(success, timing, rowcount)
    
    QueryService --> APIGateway: Return formatted results
    APIGateway --> QueryEditor: HTTP 200 + results payload
    QueryEditor -> QueryEditor: Format and display results
    QueryEditor --> User: Display results grid/message
else Execution error
    RDSB --> ConnPool: Return error details
    ConnPool --> QueryService: Error information
    
    QueryService -> RDSA: Log query execution\n(failed, error message)
    
    QueryService --> APIGateway: Return error details
    APIGateway --> QueryEditor: HTTP 400/500 + error payload
    QueryEditor -> QueryEditor: Format error message
    QueryEditor --> User: Display error notification
else Timeout
    RDSB --> ConnPool: Query timeout
    ConnPool --> QueryService: Timeout notification
    
    QueryService -> RDSA: Log query execution\n(timeout)
    QueryService -> ConnPool: Cancel query if possible
    
    QueryService --> APIGateway: Return timeout error
    APIGateway --> QueryEditor: HTTP 408 Request Timeout
    QueryEditor -> QueryEditor: Format timeout message
    QueryEditor --> User: Display timeout notification
end

deactivate RDSB
deactivate ConnPool
deactivate QueryService
deactivate APIGateway
deactivate QueryEditor

@enduml
```

## Detailed Sequence Description

This sequence diagram illustrates the complete flow of executing an SQL query in the CloudDB Manager system, which is the core functionality of the platform. Here's a detailed explanation of each phase:

### 1. Query Initiation

- **User Input**: The process begins with the user entering an SQL query in the Query Editor interface.
- **Client-Side Validation**: The React-based frontend performs immediate syntax highlighting and basic validation to provide instant feedback.
- **API Request**: The query is submitted to the backend via a POST request to `/api/queries/execute`, including both the query text and the target database instance ID.

### 2. Authentication and Authorization

- **Token Validation**: The API Gateway intercepts the request and forwards it to the Authentication Service.
- **Permission Verification**: The Authentication Service validates the JWT token against the Management Database (RDS-A) and retrieves the user's role and permission context.
- **Context Establishment**: The user's context (including tenant context and role) is attached to the request.

### 3. Query Analysis and Permission Check

- **Query Parsing**: The Query Service analyzes the submitted SQL to determine its type:
  - SELECT/SHOW (read-only queries)
  - DML (INSERT/UPDATE/DELETE) for data modification
  - DDL (CREATE/ALTER/DROP) for schema changes
- **Permission Validation**: Based on query type, different permission checks are applied:
  - READ operations: Available to all roles
  - WRITE operations: Require Developer or higher role
  - SCHEMA modifications: Require Developer or higher role with potential restrictions

### 4. Connection Management

- **Metadata Retrieval**: The Database Service fetches connection details from the Management Database (RDS-A).
- **Connection Acquisition**: The Connection Pool manages database connections efficiently:
  - Reuses existing connections when possible
  - Creates new connections as needed
  - Applies tenant-specific credentials
  - Enforces connection limits
- **Connection Security**: Tenant isolation is maintained through separate credentials and schemas.

### 5. Query Execution

- **Execution Context**: The query is executed within the tenant's sandbox environment in RDS-B.
- **Resource Controls**: Execution includes:
  - Query timeout limits
  - Result size limits
  - Transaction boundaries if applicable
- **Isolation Enforcement**: Queries only execute within the tenant's designated schema.

### 6. Result Processing and Response Handling

The sequence has three possible outcomes:

#### Successful Execution
- Results are retrieved from the database
- Query metrics (execution time, row count) are recorded in the Management Database
- Formatted results are returned through the API Gateway
- The Query Editor displays results in a user-friendly grid or message format

#### Error Handling
- Database errors are captured and translated to meaningful user messages
- Error details are logged for troubleshooting
- Appropriate HTTP status codes are returned
- The Query Editor displays a formatted error notification

#### Timeout Management
- Long-running queries are interrupted at the timeout threshold
- The system attempts to cancel the query at the database level
- Timeout events are logged for optimization purposes
- The user receives a specific timeout notification

### 7. Key Security and Performance Aspects

Throughout this sequence:

- **Multi-layered Security**: Authentication → Authorization → Data access controls
- **Tenant Isolation**: Separate schemas and credentials prevent cross-tenant data access
- **Performance Monitoring**: Query metrics are captured for analysis
- **Resource Protection**: Timeouts and limits prevent resource exhaustion
- **Connection Efficiency**: Connection pooling optimizes database resource usage

This sequence represents the most critical workflow in the CloudDB Manager system and demonstrates how the dual-database architecture provides both security isolation and operational efficiency.