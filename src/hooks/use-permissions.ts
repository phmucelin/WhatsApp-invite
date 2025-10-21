"use client";

import { useAuth } from "@/components/providers/auth-provider";

export function usePermissions() {
  const { isAdmin, isUser, isLoading } = useAuth();

  return {
    isAdmin,
    isUser,
    isLoading,
    canAccessAdmin: isAdmin,
    canAccessEvents: isUser,
  };
}