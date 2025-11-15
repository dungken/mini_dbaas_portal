"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { invitationService } from "@/lib/api/invitationService";
import { useAuthStore } from "@/lib/store/authStore";
import Button from "@/components/ui/button/Button";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { setAuth } = useAuthStore();

  const [invitationDetails, setInvitationDetails] = useState<{
    email: string;
    tenant_name: string;
    role: string;
    valid: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitationDetails();
    } else {
      setError("Invitation token is missing");
      setLoading(false);
    }
  }, [token]);

  const fetchInvitationDetails = async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const details = await invitationService.getInvitationDetails(token);
      setInvitationDetails(details);
      if (!details.valid) {
        setError("This invitation is no longer valid");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load invitation details");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invitation token is required");
      return;
    }

    setAccepting(true);
    setError("");
    setSuccess("");

    try {
      const { token: authToken, user } = await invitationService.acceptInvite({
        token,
        first_name: firstName,
        last_name: lastName,
        password,
      });

      setAuth(authToken, user);
      setSuccess("Invitation accepted! Redirecting to dashboard...");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="p-4 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitationDetails || !invitationDetails.valid) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="p-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400 mb-4">
                {error}
              </div>
            )}
            <Link href="/signin" className="text-sm text-brand-500 hover:text-brand-600">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              Accept Invitation
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You've been invited to join <strong>{invitationDetails.tenant_name}</strong> as a <strong>{invitationDetails.role}</strong>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Email: {invitationDetails.email}
            </p>
          </div>

          <form onSubmit={handleAcceptInvite}>
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

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    First Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Last Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                  </span>
                </div>
              </div>

              <div>
                <Label>
                  Confirm Password <span className="text-error-500">*</span>
                </Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={accepting}
                  className="w-full flex items-center justify-center"
                >
                  {accepting ? "Accepting..." : "Accept Invitation"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

