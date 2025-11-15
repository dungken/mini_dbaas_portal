"use client";

import { useState, useEffect } from "react";
import { userService, User } from "@/lib/api/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "@/icons";
import WithRole from "@/components/auth/WithRole";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getTenantUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError("");
    setSuccess("");

    try {
      await userService.inviteUser({ email, role });
      setSuccess("Invitation sent successfully!");
      setEmail("");
      setRole("viewer");
      closeModal();
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      // Handle quota error (403)
      if (err.response?.status === 403) {
        const errorMessage = err.response?.data?.error || err.message;
        if (errorMessage.includes('quota') || errorMessage.includes('Quota')) {
          setError("Không thể mời người dùng. Đã đạt giới hạn quota người dùng cho tenant này. Vui lòng liên hệ Super Admin để tăng quota.");
        } else {
          setError(errorMessage || "Failed to invite user. Please try again.");
        }
      } else {
        setError(err.message || "Failed to invite user. Please try again.");
      }
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setSuccess("User role updated successfully!");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      try {
        await userService.deactivateUser(userId);
        setSuccess("User deactivated successfully!");
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err: any) {
        setError(err.message || "Failed to deactivate user");
      }
    }
  };

  return (
    <WithRole roles={['TenantAdmin', 'admin', 'SuperAdmin']} fallback={
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        You don't have permission to access this page.
      </div>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users in your tenant
            </p>
          </div>
          <Button size="sm" onClick={openModal} className="flex items-center gap-2">
            <PlusIcon />
            Invite User
          </Button>
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
            <CardTitle>Users List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Role</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{user.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{user.email}</td>
                        <td className="px-4 py-2 text-sm">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="Developer">Developer</option>
                            <option value="TenantAdmin">Tenant Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivateUser(user.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <TrashBinIcon />
                            Deactivate
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
          <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Invite User
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Send an invitation to a new user
              </p>
            </div>
            <form onSubmit={handleInviteUser} className="flex flex-col">
              <div className="px-2 pb-3">
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}
                <div className="space-y-5">
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>
                      Role <span className="text-error-500">*</span>
                    </Label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-900"
                      required
                    >
                      <option value="viewer">Viewer</option>
                      <option value="Developer">Developer</option>
                      <option value="TenantAdmin">Tenant Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={inviting}>
                  {inviting ? "Inviting..." : "Invite User"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </WithRole>
  );
}

