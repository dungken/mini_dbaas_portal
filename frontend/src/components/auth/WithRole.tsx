"use client";

import { useAuthStore } from "@/lib/store/authStore";

interface WithRoleProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * HOC Component để ẩn/hiện UI dựa trên role của user
 * @param roles - Mảng các roles được phép (ví dụ: ['Developer', 'TenantAdmin'])
 * @param children - Component sẽ hiển thị nếu user có role phù hợp
 * @param fallback - Component sẽ hiển thị nếu user không có role phù hợp (optional)
 */
export default function WithRole({ roles, children, fallback = null }: WithRoleProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "";

  if (!userRole || !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook để check role của user
 */
export function useHasRole(requiredRoles: string[]): boolean {
  const { user } = useAuthStore();
  const userRole = user?.role || "";
  return requiredRoles.includes(userRole);
}

