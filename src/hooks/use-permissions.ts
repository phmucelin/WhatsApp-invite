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
        const tokenData = JSON.parse(Buffer.from(authToken, 'base64').toString());
        setPermissions({
          isAdmin: tokenData.role === 'ADMIN',
          isUser: true,
          isLoading: false,
        });
      } catch (error) {
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