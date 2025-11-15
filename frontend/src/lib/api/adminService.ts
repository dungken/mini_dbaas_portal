// Admin Service - API calls cho Super Admin operations
// Hiện tại dùng mock data, sau này chỉ cần thay apiClient.baseURL và các endpoint

import { apiClient } from './axios';

// Types
export interface Tenant {
  id: number;
  name: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface ResourceQuota {
  id?: number;
  tenant_id: number;
  quota_type: string;
  value: number;
}

export interface SystemSetting {
  key: string;
  value: string;
}

// Mock data
const mockTenants: Tenant[] = [
  {
    id: 1,
    name: 'Acme Corp',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Tech Startup',
    status: 'active',
    created_at: '2025-01-02T00:00:00Z',
  },
];

const mockQuotas: Record<number, ResourceQuota[]> = {
  1: [
    { tenant_id: 1, quota_type: 'max_users', value: 10 },
    { tenant_id: 1, quota_type: 'max_db_instances', value: 5 },
  ],
  2: [
    { tenant_id: 2, quota_type: 'max_users', value: 20 },
    { tenant_id: 2, quota_type: 'max_db_instances', value: 10 },
  ],
};

const mockSystemSettings: SystemSetting[] = [
  { key: 'password_min_length', value: '8' },
  { key: 'password_require_uppercase', value: 'true' },
  { key: 'password_require_numbers', value: 'true' },
];

// API Functions
export const adminService = {
  // Get all tenants
  async getTenants(): Promise<Tenant[]> {
    try {
      const response = await apiClient.get<Tenant[]>('/api/v1/admin/tenants');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return mockTenants;
    }
  },

  // Create tenant
  async createTenant(name: string): Promise<Tenant> {
    try {
      const response = await apiClient.post<Tenant>('/api/v1/admin/tenants', { name });
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const newTenant: Tenant = {
        id: mockTenants.length + 1,
        name,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      mockTenants.push(newTenant);
      return newTenant;
    }
  },

  // Update tenant
  async updateTenant(id: number, data: { name?: string; status?: 'active' | 'suspended' }): Promise<Tenant> {
    try {
      const response = await apiClient.put<Tenant>(`/api/v1/admin/tenants/${id}`, data);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const tenant = mockTenants.find((t) => t.id === id);
      if (tenant) {
        if (data.name) tenant.name = data.name;
        if (data.status) tenant.status = data.status;
        return tenant;
      }
      throw new Error('Tenant not found');
    }
  },

  // Get tenant quotas
  async getTenantQuotas(tenantId: number): Promise<ResourceQuota[]> {
    try {
      const response = await apiClient.get<ResourceQuota[]>(`/api/v1/admin/tenants/${tenantId}/quotas`);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return mockQuotas[tenantId] || [
        { tenant_id: tenantId, quota_type: 'max_users', value: 10 },
        { tenant_id: tenantId, quota_type: 'max_db_instances', value: 5 },
      ];
    }
  },

  // Update tenant quotas
  async updateTenantQuotas(tenantId: number, quotas: ResourceQuota[]): Promise<ResourceQuota[]> {
    try {
      const response = await apiClient.put<ResourceQuota[]>(`/api/v1/admin/tenants/${tenantId}/quotas`, {
        quotas,
      });
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      mockQuotas[tenantId] = quotas;
      return quotas;
    }
  },

  // Get system settings
  async getSystemSettings(): Promise<SystemSetting[]> {
    try {
      const response = await apiClient.get<SystemSetting[]>('/api/v1/admin/settings');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return mockSystemSettings;
    }
  },

  // Update system settings
  async updateSystemSettings(settings: SystemSetting[]): Promise<SystemSetting[]> {
    try {
      const response = await apiClient.put<SystemSetting[]>('/api/v1/admin/settings', { settings });
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      mockSystemSettings.splice(0, mockSystemSettings.length, ...settings);
      return settings;
    }
  },
};

