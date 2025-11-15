// DB Service - API calls cho database operations
// Hiện tại dùng mock data, sau này chỉ cần thay apiClient.baseURL và các endpoint

import { apiClient } from './axios';

// Types
export interface DatabaseSchema {
  name: string;
  tables: TableInfo[];
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  key?: string;
}

export interface SelectResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTime?: number;
}

export interface DMLResult {
  status: 'ok' | 'error';
  rows_affected: number;
  message?: string;
}

export interface DDLResult {
  status: 'ok' | 'error';
  message: string;
}

export interface DatabaseInstance {
  id: number;
  name: string;
  schema_name: string;
  created_at: string;
  status: 'active' | 'inactive';
}

// Mock data
const mockSchemas: DatabaseSchema[] = [
  {
    name: 'tenant_1_sandbox',
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'int', nullable: false, key: 'PRI' },
          { name: 'username', type: 'varchar(100)', nullable: false },
          { name: 'email', type: 'varchar(255)', nullable: false },
          { name: 'created_at', type: 'datetime', nullable: false },
        ],
      },
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'int', nullable: false, key: 'PRI' },
          { name: 'user_id', type: 'int', nullable: false },
          { name: 'total', type: 'decimal(10,2)', nullable: false },
          { name: 'status', type: 'varchar(50)', nullable: false },
        ],
      },
    ],
  },
];

const mockInstances: DatabaseInstance[] = [
  {
    id: 1,
    name: 'Sandbox DB 1',
    schema_name: 'tenant_1_sandbox',
    created_at: '2025-01-01T00:00:00Z',
    status: 'active',
  },
];

// API Functions
export const dbService = {
  // Get database schema (tables and columns)
  async getSchema(): Promise<DatabaseSchema[]> {
    try {
      const response = await apiClient.get<DatabaseSchema[]>('/api/v1/db/schema');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return mockSchemas;
    }
  },

  // Execute SELECT query
  async executeSelect(query: string): Promise<SelectResult> {
    try {
      const response = await apiClient.post<QueryResult>('/api/v1/query/select', {
        query,
      });
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      // Parse mock query result
      if (query.toLowerCase().includes('select * from users')) {
        return {
          columns: ['id', 'username', 'email', 'created_at'],
          rows: [
            { id: 1, username: 'john_doe', email: 'john@example.com', created_at: '2025-01-01 10:00:00' },
            { id: 2, username: 'jane_smith', email: 'jane@example.com', created_at: '2025-01-02 11:00:00' },
            { id: 3, username: 'bob_wilson', email: 'bob@example.com', created_at: '2025-01-03 12:00:00' },
          ],
          executionTime: 15,
        };
      }

      if (query.toLowerCase().includes('select * from orders')) {
        return {
          columns: ['id', 'user_id', 'total', 'status'],
          rows: [
            { id: 1, user_id: 1, total: 99.99, status: 'completed' },
            { id: 2, user_id: 2, total: 149.50, status: 'pending' },
          ],
          executionTime: 12,
        };
      }

      // Default empty result
      return {
        columns: [],
        rows: [],
        executionTime: 0,
      };
    }
  },

  // Execute DML query (INSERT, UPDATE, DELETE)
  async executeDML(query: string): Promise<DMLResult> {
    try {
      const response = await apiClient.post<DMLResult>('/api/v1/query/dml', {
        query,
      });
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      // Parse mock DML result
      const lowerQuery = query.toLowerCase();
      let rowsAffected = 1;

      if (lowerQuery.includes('insert')) {
        rowsAffected = 1;
      } else if (lowerQuery.includes('update')) {
        rowsAffected = lowerQuery.includes('where') ? 1 : 0;
      } else if (lowerQuery.includes('delete')) {
        rowsAffected = lowerQuery.includes('where') ? 1 : 0;
      }

      return {
        status: 'ok',
        rows_affected: rowsAffected,
        message: `Query OK, ${rowsAffected} row(s) affected`,
      };
    }
  },

  // Execute DDL query (CREATE, ALTER, DROP, TRUNCATE)
  async executeDDL(query: string): Promise<DDLResult> {
    try {
      const response = await apiClient.post<DDLResult>('/api/v1/query/ddl', {
        query,
      });
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      // Parse mock DDL result
      const lowerQuery = query.toLowerCase();
      let message = 'Query executed successfully';

      if (lowerQuery.includes('create table')) {
        const tableMatch = query.match(/create table\s+(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : 'table';
        message = `Table '${tableName}' created successfully`;
      } else if (lowerQuery.includes('drop table')) {
        const tableMatch = query.match(/drop table\s+(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : 'table';
        message = `Table '${tableName}' dropped successfully`;
      } else if (lowerQuery.includes('alter table')) {
        message = 'Table altered successfully';
      } else if (lowerQuery.includes('truncate')) {
        const tableMatch = query.match(/truncate\s+table\s+(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : 'table';
        message = `Table '${tableName}' truncated successfully`;
      }

      return {
        status: 'ok',
        message,
      };
    }
  },

  // Get all database instances
  async getInstances(): Promise<DatabaseInstance[]> {
    try {
      const response = await apiClient.get<DatabaseInstance[]>('/api/v1/instances');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return mockInstances;
    }
  },

  // Create new database instance
  async createInstance(name: string): Promise<DatabaseInstance> {
    try {
      const response = await apiClient.post<DatabaseInstance>('/api/v1/instances', {
        name,
      });
      return response.data;
    } catch (error: any) {
      // If it's a 403 quota error from API, rethrow it
      if (error.response?.status === 403) {
        throw error;
      }

      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const newInstance: DatabaseInstance = {
        id: mockInstances.length + 1,
        name,
        schema_name: `tenant_${mockInstances.length + 1}_sandbox`,
        created_at: new Date().toISOString(),
        status: 'active',
      };
      mockInstances.push(newInstance);
      return newInstance;
    }
  },

  // Delete database instance
  async deleteInstance(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/instances/${id}`);
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const index = mockInstances.findIndex((i) => i.id === id);
      if (index !== -1) {
        mockInstances.splice(index, 1);
      }
    }
  },

  // Toggle instance status (Start/Stop)
  async toggleInstance(id: number): Promise<DatabaseInstance> {
    try {
      const response = await apiClient.post<DatabaseInstance>(`/api/v1/instances/${id}/toggle`);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const instance = mockInstances.find((i) => i.id === id);
      if (instance) {
        instance.status = instance.status === 'active' ? 'stopped' : 'active';
        return instance;
      }
      throw new Error('Instance not found');
    }
  },
};

// Export mockInstances để có thể update từ component
export { mockInstances };

