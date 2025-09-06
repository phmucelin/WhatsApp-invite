"use client";

import { useSession } from "next-auth/react";

export function usePermissions() {
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";
  const isUser = session?.user?.role === "USER";

  return {
    isAdmin,
    isUser,
    canAccessAdmin: isAdmin,
    canAccessEvents: isAdmin || isUser, // Ambos podem acessar eventos
  };
} 