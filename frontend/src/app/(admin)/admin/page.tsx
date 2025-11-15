"use client";

import { useState, useEffect } from "react";
import { adminService, Tenant } from "@/lib/api/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { PlusIcon, PencilIcon, BoltIcon } from "@/icons";
import WithRole from "@/components/auth/WithRole";
import Link from "next/link";

export default function AdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen: isCreateOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal();
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantName, setTenantName] = useState("");
  const [tenantStatus, setTenantStatus] = useState<'active' | 'suspended'>('active');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTenants();
      setTenants(data);
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      await adminService.createTenant(tenantName);
      setSuccess("Tenant created successfully!");
      setTenantName("");
      closeCreateModal();
      fetchTenants();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create tenant. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      await adminService.updateTenant(editingTenant.id, {
        name: tenantName,
        status: tenantStatus,
      });
      setSuccess("Tenant updated successfully!");
      setEditingTenant(null);
      setTenantName("");
      fetchTenants();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update tenant. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setTenantName(tenant.name);
    setTenantStatus(tenant.status);
  };

  const closeEditModal = () => {
    setEditingTenant(null);
    setTenantName("");
    setTenantStatus('active');
  };

  return (
    <WithRole roles={['SuperAdmin', 'admin']} fallback={
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        You don't have permission to access this page.
      </div>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage tenants and system configuration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <BoltIcon />
                System Settings
              </Button>
            </Link>
            <Button size="sm" onClick={openCreateModal} className="flex items-center gap-2">
              <PlusIcon />
              Create Tenant
            </Button>
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
            <CardTitle>Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                Loading tenants...
              </div>
            ) : tenants.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                No tenants found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Created</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{tenant.name}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${tenant.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                          {new Date(tenant.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/tenants/${tenant.id}/quotas`}>
                              <Button size="sm" variant="outline">
                                Manage Quotas
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(tenant)}
                              className="flex items-center gap-1"
                            >
                              <PencilIcon />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Tenant Modal */}
        <Modal isOpen={isCreateOpen} onClose={closeCreateModal} className="max-w-[500px] m-4">
          <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Create Tenant
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Create a new tenant organization
              </p>
            </div>
            <form onSubmit={handleCreateTenant} className="flex flex-col">
              <div className="px-2 pb-3">
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}
                <div className="space-y-5">
                  <div>
                    <Label>
                      Tenant Name <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter tenant name"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeCreateModal}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Tenant"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Edit Tenant Modal */}
        <Modal isOpen={!!editingTenant} onClose={closeEditModal} className="max-w-[500px] m-4">
          <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Tenant
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update tenant information
              </p>
            </div>
            <form onSubmit={handleUpdateTenant} className="flex flex-col">
              <div className="px-2 pb-3">
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}
                <div className="space-y-5">
                  <div>
                    <Label>
                      Tenant Name <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter tenant name"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>
                      Status <span className="text-error-500">*</span>
                    </Label>
                    <select
                      value={tenantStatus}
                      onChange={(e) => setTenantStatus(e.target.value as 'active' | 'suspended')}
                      className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-900"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeEditModal}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={creating}>
                  {creating ? "Updating..." : "Update Tenant"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </WithRole>
  );
}

