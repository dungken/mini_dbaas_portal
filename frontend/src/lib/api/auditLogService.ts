// Audit Log Service - API calls cho audit logs
// Hiện tại dùng mock data, sau này chỉ cần thay apiClient.baseURL và các endpoint

import { apiClient } from './axios';

// Types
export interface AuditLog {
  id: number;
  user_id: number;
  tenant_id: number;
  action: string;
  resource_type: string;
  resource_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  details: Record<string, any> | null;
}

export interface AuditLogFilters {
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Mock audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    tenant_id: 1,
    action: 'LOGIN',
    resource_type: 'auth',
    resource_id: null,
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0...',
    created_at: '2025-01-01T10:00:00Z',
    details: { success: true },
  },
  {
    id: 2,
    user_id: 1,
    tenant_id: 1,
    action: 'CREATE_INSTANCE',
    resource_type: 'instance',
    resource_id: 1,
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0...',
    created_at: '2025-01-01T11:00:00Z',
    details: { instance_name: 'test_db' },
  },
  {
    id: 3,
    user_id: 2,
    tenant_id: 1,
    action: 'INVITE_USER',
    resource_type: 'user',
    resource_id: 3,
    ip_address: '192.168.1.2',
    user_agent: 'Mozilla/5.0...',
    created_at: '2025-01-01T12:00:00Z',
    details: { email: 'newuser@example.com', role: 'Developer' },
  },
];

// API Functions
export const auditLogService = {
  // Get tenant audit logs (for Tenant Admin)
  async getTenantAuditLogs(filters?: AuditLogFilters): Promise<AuditLogResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.action) params.append('action', filters.action);
      if (filters?.resource_type) params.append('resource_type', filters.resource_type);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<AuditLogResponse>(`/api/v1/audit-logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        logs: mockAuditLogs.slice(start, end),
        total: mockAuditLogs.length,
        page,
        limit,
        total_pages: Math.ceil(mockAuditLogs.length / limit),
      };
    }
  },

  // Get system-wide audit logs (for Super Admin)
  async getSystemAuditLogs(filters?: AuditLogFilters): Promise<AuditLogResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.action) params.append('action', filters.action);
      if (filters?.resource_type) params.append('resource_type', filters.resource_type);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<AuditLogResponse>(`/api/v1/admin/audit-logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        logs: mockAuditLogs.slice(start, end),
        total: mockAuditLogs.length,
        page,
        limit,
        total_pages: Math.ceil(mockAuditLogs.length / limit),
      };
    }
  },
};

