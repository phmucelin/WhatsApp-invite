"use client";

// Hook temporário para permissões - será implementado com novo sistema de auth
export function usePermissions() {
  return {
    isAdmin: false, // Temporário - sempre false até implementar novo sistema
    isLoading: false,
  };
}