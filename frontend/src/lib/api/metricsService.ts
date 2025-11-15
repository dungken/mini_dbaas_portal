// Metrics Service - API calls cho metrics/analytics
// Hiện tại dùng mock data, sau này chỉ cần thay apiClient.baseURL và các endpoint

import { apiClient } from './axios';

// Types
export interface TenantMetrics {
  total_queries: number;
  total_logs: number;
  total_instances: number;
  active_users: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface MetricsChart {
  query_execution_time: ChartDataPoint[];
  resource_utilization: ChartDataPoint[];
  connection_pool_stats: ChartDataPoint[];
}

// Mock chart data
const mockChartData: MetricsChart = {
  query_execution_time: [
    { date: '2025-01-01', value: 120 },
    { date: '2025-01-02', value: 150 },
    { date: '2025-01-03', value: 180 },
    { date: '2025-01-04', value: 200 },
    { date: '2025-01-05', value: 170 },
    { date: '2025-01-06', value: 190 },
    { date: '2025-01-07', value: 210 },
  ],
  resource_utilization: [
    { date: '2025-01-01', value: 45 },
    { date: '2025-01-02', value: 50 },
    { date: '2025-01-03', value: 55 },
    { date: '2025-01-04', value: 60 },
    { date: '2025-01-05', value: 58 },
    { date: '2025-01-06', value: 62 },
    { date: '2025-01-07', value: 65 },
  ],
  connection_pool_stats: [
    { date: '2025-01-01', value: 10 },
    { date: '2025-01-02', value: 12 },
    { date: '2025-01-03', value: 15 },
    { date: '2025-01-04', value: 18 },
    { date: '2025-01-05', value: 16 },
    { date: '2025-01-06', value: 20 },
    { date: '2025-01-07', value: 22 },
  ],
};

// API Functions
export const metricsService = {
  // Get tenant metrics
  async getTenantMetrics(): Promise<TenantMetrics> {
    try {
      const response = await apiClient.get<TenantMetrics>('/api/v1/metrics/tenant');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return {
        total_queries: 150,
        total_logs: 300,
        total_instances: 5,
        active_users: 12,
      };
    }
  },

  // Get tenant charts data
  async getTenantCharts(): Promise<MetricsChart> {
    try {
      const response = await apiClient.get<MetricsChart>('/api/v1/metrics/tenant/charts');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return mockChartData;
    }
  },

  // Get system-wide metrics (for Super Admin)
  async getSystemMetrics(): Promise<TenantMetrics> {
    try {
      const response = await apiClient.get<TenantMetrics>('/api/v1/admin/metrics');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return {
        total_queries: 500,
        total_logs: 1000,
        total_instances: 20,
        active_users: 50,
      };
    }
  },

  // Get system-wide charts data (for Super Admin)
  async getSystemCharts(): Promise<MetricsChart> {
    try {
      const response = await apiClient.get<MetricsChart>('/api/v1/admin/metrics/charts');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return mockChartData;
    }
  },
};


