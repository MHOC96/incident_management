"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardRoute } from "@/lib/routes";
import type { UserRole } from "@/types";

type RequireAuthProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(getDashboardRoute(user.role));
    }
  }, [allowedRoles, isAuthenticated, isLoading, router, user]);

  if (isLoading) {
    return (
      <PageContainer width="app">
        <div className="py-16 text-sm text-text-secondary">Checking your sign-in status...</div>
      </PageContainer>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}
