"use client";

import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { userService, UserPreferences } from "@/lib/api/userService";
import Checkbox from "../form/input/Checkbox";

export default function UserPreferencesCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [preferences, setPreferences] = useState<UserPreferences>({
    notification_preferences: true,
    default_theme: 'system',
    email_notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const data = await userService.getUserPreferences();
      setPreferences(data);
    } catch (err) {
      console.error("Failed to fetch preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await userService.updateUserPreferences(preferences);
      setSuccess("Preferences updated successfully!");
      closeModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Preferences
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Notification Preferences
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {loading ? "Loading..." : preferences.notification_preferences ? "Enabled" : "Disabled"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Default Theme
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {loading ? "Loading..." : preferences.default_theme.charAt(0).toUpperCase() + preferences.default_theme.slice(1)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email Notifications
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {loading ? "Loading..." : preferences.email_notifications ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Preferences
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Customize your preferences
            </p>
          </div>
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="px-2 pb-3">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {success}
                </div>
              )}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={preferences.notification_preferences}
                    onChange={(checked) => setPreferences({ ...preferences, notification_preferences: checked })}
                  />
                  <Label className="cursor-pointer">Enable notification preferences</Label>
                </div>

                <div>
                  <Label>Default Theme</Label>
                  <select
                    value={preferences.default_theme}
                    onChange={(e) => setPreferences({ ...preferences, default_theme: e.target.value as 'light' | 'dark' | 'system' })}
                    className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-900"
                    required
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={preferences.email_notifications}
                    onChange={(checked) => setPreferences({ ...preferences, email_notifications: checked })}
                  />
                  <Label className="cursor-pointer">Enable email notifications</Label>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

