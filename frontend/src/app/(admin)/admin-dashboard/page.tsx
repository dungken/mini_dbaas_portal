"use client";

import { useState, useEffect } from "react";
import { metricsService, TenantMetrics, MetricsChart } from "@/lib/api/metricsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import WithRole from "@/components/auth/WithRole";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [charts, setCharts] = useState<MetricsChart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsData, chartsData] = await Promise.all([
        metricsService.getTenantMetrics(),
        metricsService.getTenantCharts(),
      ]);
      setMetrics(metricsData);
      setCharts(chartsData);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithRole roles={['TenantAdmin', 'admin', 'SuperAdmin']} fallback={
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        You don't have permission to access this page.
      </div>
    }>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            View system metrics and statistics
          </p>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4">Loading metrics...</p>
          </div>
        ) : metrics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Queries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
                    {metrics.total_queries}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
                    {metrics.total_logs}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Instances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
                    {metrics.total_instances}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
                    {metrics.active_users}
                  </p>
                </CardContent>
              </Card>
            </div>

            {charts && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      Query Execution Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={charts.query_execution_time}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: any) => [`${value}ms`, 'Execution Time']}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#4F46E5"
                          strokeWidth={2}
                          name="Execution Time (ms)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      Resource Utilization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={charts.resource_utilization}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: any) => [`${value}%`, 'Utilization']}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.3}
                          name="Utilization (%)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Failed to load metrics
          </div>
        )}
      </div>
    </WithRole>
  );
}

