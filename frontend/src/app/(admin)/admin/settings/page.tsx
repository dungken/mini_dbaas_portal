"use client";

import { useState, useEffect } from "react";
import { adminService, SystemSetting } from "@/lib/api/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import WithRole from "@/components/auth/WithRole";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = (index: number, value: string) => {
    const newSettings = [...settings];
    newSettings[index].value = value;
    setSettings(newSettings);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await adminService.updateSystemSettings(settings);
      setSuccess("Settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading settings...
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
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground">
              Configure system-wide settings
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
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave}>
              <div className="space-y-6">
                {settings.map((setting, index) => (
                  <div key={setting.key}>
                    <Label>
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                    {setting.key.includes('require') || setting.key.includes('enable') ? (
                      <select
                        value={setting.value}
                        onChange={(e) => handleUpdateSetting(index, e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-900"
                        required
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <Input
                        type={setting.key.includes('password') ? 'number' : 'text'}
                        value={setting.value}
                        onChange={(e) => handleUpdateSetting(index, e.target.value)}
                        required
                      />
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-4">
                  <Button size="sm" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Settings"}
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

