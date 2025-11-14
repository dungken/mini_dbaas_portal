-- SQL script to create the database schema for the Mini DBaaS Portal

-- Drop tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS UserTenantRoles;
DROP TABLE IF EXISTS QueryHistory;
DROP TABLE IF EXISTS AuditLogs;
DROP TABLE IF EXISTS UserPreferences;
DROP TABLE IF EXISTS Invitations;
DROP TABLE IF EXISTS Connections;
DROP TABLE IF EXISTS DatabaseInstances;
DROP TABLE IF EXISTS ResourceQuotas;
DROP TABLE IF EXISTS Metrics;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Tenants;
DROP TABLE IF EXISTS Roles;

-- Create the Tenants table
CREATE TABLE Tenants (
    tenant_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200),
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    billing_email VARCHAR(255),
    subscription_plan VARCHAR(50),
    subscription_status VARCHAR(50),
    trial_expiry TIMESTAMP
);

-- Create the Roles table
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    permissions TEXT,
    is_system_role BOOLEAN DEFAULT FALSE
);

-- Create the Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    profile_image VARCHAR(255),
    is_email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_expiry TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expiry TIMESTAMP,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP
);

-- Create the UserTenantRoles junction table
CREATE TABLE UserTenantRoles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tenant_id INT NOT NULL,
    role_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE,
    UNIQUE (user_id, tenant_id, role_id)
);

-- Create the DatabaseInstances table
CREATE TABLE DatabaseInstances (
    instance_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    created_by INT NOT NULL,
    name VARCHAR(64) NOT NULL,
    display_name VARCHAR(100),
    schema_name VARCHAR(64) NOT NULL,
    status ENUM('running', 'stopped', 'deleted') NOT NULL DEFAULT 'running',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP,
    db_size BIGINT,
    is_template BOOLEAN DEFAULT FALSE,
    template_source INT,
    description TEXT,
    auto_stop BOOLEAN DEFAULT TRUE,
    auto_stop_minutes INT DEFAULT 60,
    deleted_at TIMESTAMP,
    purge_scheduled_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE CASCADE,
    UNIQUE (tenant_id, name)
);

-- Create the Connections table
CREATE TABLE Connections (
    connection_id INT AUTO_INCREMENT PRIMARY KEY,
    instance_id INT NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_encrypted VARCHAR(255) NOT NULL,
    encryption_key_id VARCHAR(100),
    max_connections INT DEFAULT 10,
    idle_timeout_seconds INT DEFAULT 300,
    FOREIGN KEY (instance_id) REFERENCES DatabaseInstances(instance_id) ON DELETE CASCADE
);

-- Create the QueryHistory table
CREATE TABLE QueryHistory (
    query_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    instance_id INT NOT NULL,
    query_text TEXT NOT NULL,
    execution_time_ms INT,
    row_count INT,
    status ENUM('success', 'error', 'timeout') NOT NULL,
    error_message TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    is_favorite BOOLEAN DEFAULT FALSE,
    query_type ENUM('select', 'dml', 'ddl', 'other'),
    affected_rows INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (instance_id) REFERENCES DatabaseInstances(instance_id) ON DELETE CASCADE
);

-- Create the ResourceQuotas table
CREATE TABLE ResourceQuotas (
    quota_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT,
    user_id INT,
    resource_type VARCHAR(50) NOT NULL,
    max_value INT NOT NULL,
    current_usage INT DEFAULT 0,
    update_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    alert_threshold INT,
    alert_triggered BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create the AuditLogs table
CREATE TABLE AuditLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    tenant_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE SET NULL
);

-- Create the Invitations table
CREATE TABLE Invitations (
    invitation_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    invited_by INT NOT NULL,
    role_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('pending', 'accepted', 'expired') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP,
    message TEXT,
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE
);

-- Create the UserPreferences table
CREATE TABLE UserPreferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    UNIQUE (user_id, preference_key)
);

-- Create the Metrics table
CREATE TABLE Metrics (
    metric_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT,
    instance_id INT,
    user_id INT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DOUBLE NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aggregation_period VARCHAR(20),
    FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE SET NULL,
    FOREIGN KEY (instance_id) REFERENCES DatabaseInstances(instance_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);
