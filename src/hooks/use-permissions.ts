"use client";

import { useState, useEffect } from "react";

export function usePermissions() {
  const [permissions, setPermissions] = useState({
    isAdmin: false,
    isUser: false,
    isLoading: true,
  });

  useEffect(() => {
    // Verificar se há token de autenticação
    const authToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

    if (authToken) {
      try {
        // Decodificar base64 sem usar Buffer (que não existe no cliente)
        const tokenData = JSON.parse(atob(authToken));
        setPermissions({
          isAdmin: tokenData.role === 'ADMIN',
          isUser: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
        setPermissions({
          isAdmin: false,
          isUser: false,
          isLoading: false,
        });
      }
    } else {
      setPermissions({
        isAdmin: false,
        isUser: false,
        isLoading: false,
      });
    }
  }, []);

  return {
    ...permissions,
    canAccessAdmin: permissions.isAdmin,
    canAccessEvents: permissions.isUser,
  };
}