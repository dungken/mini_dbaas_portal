"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Hoặc có thể return loading spinner
  }

  return <>{children}</>;
}

