"use client";

import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { apiClient } from "@/lib/api/axios";
import axios from "axios";

export default function ChangePasswordCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await apiClient.put("/users/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess("Password changed successfully!");
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Close modal after 2 seconds
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error as string);
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Change Password
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update your password to keep your account secure
          </p>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          Change Password
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter your current password and new password
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col">
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
              <div className="space-y-5">
                <div>
                  <Label>
                    Current Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showCurrentPassword ? <EyeIcon /> : <EyeCloseIcon />}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>
                    New Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showNewPassword ? <EyeIcon /> : <EyeCloseIcon />}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>
                    Confirm New Password <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

