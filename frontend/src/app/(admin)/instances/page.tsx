"use client";

import { Metadata } from "next";
import { useState, useEffect } from "react";
import { dbService, DatabaseInstance } from "@/lib/api/dbService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { PlusIcon, TrashBinIcon, BoltIcon } from "@/icons";
import WithRole from "@/components/auth/WithRole";
import axios from "axios";

export default function InstancesPage() {
  const [instances, setInstances] = useState<DatabaseInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [instanceName, setInstanceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const data = await dbService.getInstances();
      setInstances(data);
    } catch (error) {
      console.error("Failed to fetch instances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const newInstance = await dbService.createInstance(instanceName);
      setInstances([...instances, newInstance]);
      setSuccess("Instance created successfully!");
      setInstanceName("");
      closeModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      // Handle quota error (403)
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        const errorMessage = err.response?.data?.error || err.message;
        if (errorMessage.includes('quota') || errorMessage.includes('Quota')) {
          setError("Không thể tạo instance. Đã đạt giới hạn quota CSDL cho tenant này. Vui lòng liên hệ Super Admin để tăng quota.");
        } else {
          setError(errorMessage || "Failed to create instance. Please try again.");
        }
      } else if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error as string);
      } else {
        setError(err.message || "Failed to create instance. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Instances</h1>
          <p className="text-muted-foreground">
            Manage your database instances
          </p>
        </div>
        <Button size="sm" onClick={openModal} className="flex items-center gap-2">
          <PlusIcon />
          Create Instance
        </Button>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instances List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
              Loading instances...
            </div>
          ) : instances.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              No instances found. Create your first instance to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {instances.map((instance) => (
                <div
                  key={instance.id}
                  className="p-4 border border-gray-200 rounded-lg dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {instance.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Schema: {instance.schema_name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Created: {new Date(instance.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${instance.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                      >
                        {instance.status}
                      </span>
                      <WithRole roles={['Developer', 'TenantAdmin', 'admin', 'SuperAdmin']}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await dbService.toggleInstance(instance.id);
                              fetchInstances();
                              setSuccess(`Instance ${instance.status === 'active' ? 'stopped' : 'started'} successfully!`);
                              setTimeout(() => setSuccess(""), 3000);
                            } catch (err: any) {
                              setError(err.message || "Failed to toggle instance");
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <BoltIcon />
                          {instance.status === 'active' ? 'Stop' : 'Start'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete "${instance.name}"? This action cannot be undone.`)) {
                              try {
                                await dbService.deleteInstance(instance.id);
                                fetchInstances();
                                setSuccess("Instance deleted successfully!");
                                setTimeout(() => setSuccess(""), 3000);
                              } catch (err: any) {
                                setError(err.message || "Failed to delete instance");
                              }
                            }
                          }}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <TrashBinIcon />
                          Delete
                        </Button>
                      </WithRole>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create Database Instance
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Create a new sandbox database instance for your tenant
            </p>
          </div>
          <form onSubmit={handleCreateInstance} className="flex flex-col">
            <div className="px-2 pb-3">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="space-y-5">
                <div>
                  <Label>
                    Instance Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter instance name"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Instance"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

