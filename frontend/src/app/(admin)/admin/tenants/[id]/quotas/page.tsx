"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService, ResourceQuota } from "@/lib/api/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import WithRole from "@/components/auth/WithRole";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";

export default function TenantQuotasPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);
  const [quotas, setQuotas] = useState<ResourceQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchQuotas();
  }, [tenantId]);

  const fetchQuotas = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTenantQuotas(tenantId);
      setQuotas(data);
    } catch (error) {
      console.error("Failed to fetch quotas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuota = (index: number, value: number) => {
    const newQuotas = [...quotas];
    newQuotas[index].value = value;
    setQuotas(newQuotas);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adminService.updateTenantQuotas(tenantId, quotas);
      setSuccess("Quotas updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update quotas. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading quotas...
      </div>
    );
  }

  return (
    <WithRole roles={['SuperAdmin', 'admin']} fallback={
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        You don't have permission to access this page.
      </div>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
            >
              <ChevronLeftIcon />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Resource Quotas</h1>
            <p className="text-muted-foreground">
              Manage resource quotas for Tenant #{tenantId}
            </p>
          </div>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quota Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave}>
              <div className="space-y-6">
                {quotas.map((quota, index) => (
                  <div key={quota.quota_type}>
                    <Label>
                      {quota.quota_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={quota.value}
                      onChange={(e) => handleUpdateQuota(index, parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-4">
                  <Button size="sm" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Quotas"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </WithRole>
  );
}

