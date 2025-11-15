"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon } from "@/icons";
import { authService } from "@/lib/api/authService";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const [token, setToken] = useState(tokenFromUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please enter verification token");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authService.verifyEmail(token);
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please check the token and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to sign in
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verify Email
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the verification token from the console/email (for development)
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {success}
                </div>
              )}
              <div>
                <Label>
                  Verification Token <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Paste verification token here"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Check the backend console for the verification token
                </p>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

