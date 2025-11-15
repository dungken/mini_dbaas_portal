"use client";

import { useState, useEffect } from "react";
import { auditLogService, AuditLog, AuditLogFilters } from "@/lib/api/auditLogService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import WithRole from "@/components/auth/WithRole";
import { useAuthStore } from "@/lib/store/authStore";

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'admin';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<AuditLogFilters>({
    action: '',
    resource_type: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = isSuperAdmin
        ? await auditLogService.getSystemAuditLogs({ ...filters, page, limit })
        : await auditLogService.getTenantAuditLogs({ ...filters, page, limit });
      setLogs(response.logs);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      action: '',
      resource_type: '',
      start_date: '',
      end_date: '',
    });
    setPage(1);
  };

  return (
    <WithRole roles={['TenantAdmin', 'SuperAdmin', 'admin']} fallback={
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        You don't have permission to access this page.
      </div>
    }>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            View system activity and audit trail
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Action</Label>
                <Input
                  type="text"
                  placeholder="e.g. LOGIN, CREATE_INSTANCE"
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                />
              </div>
              <div>
                <Label>Resource Type</Label>
                <Input
                  type="text"
                  placeholder="e.g. auth, instance, user"
                  value={filters.resource_type}
                  onChange={(e) => handleFilterChange('resource_type', e.target.value)}
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetFilters}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4">Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No audit logs found.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Action</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Resource</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">IP Address</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                            {log.resource_type}
                            {log.resource_id && ` #${log.resource_id}`}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                            {log.ip_address || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                            {log.details ? (
                              <details>
                                <summary className="cursor-pointer text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                  View Details
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </WithRole>
  );
}

