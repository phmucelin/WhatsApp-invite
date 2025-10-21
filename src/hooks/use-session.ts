"use client";

import { useState, useEffect } from 'react';

interface SessionData {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useSession() {
  const [sessionData, setSessionData] = useState<SessionData>({
    sessionId: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const getSession = async () => {
      try {
        const response = await fetch('/api/session');
        const data = await response.json();
        
        if (response.ok) {
          setSessionData({
            sessionId: data.sessionId,
            isLoading: false,
            error: null
          });
        } else {
          setSessionData({
            sessionId: null,
            isLoading: false,
            error: data.error || 'Erro ao obter sessão'
          });
        }
      } catch (error) {
        setSessionData({
          sessionId: null,
          isLoading: false,
          error: 'Erro de conexão'
        });
      }
    };

    getSession();
  }, []);

  const clearSession = async () => {
    try {
      await fetch('/api/session', { method: 'DELETE' });
      setSessionData({
        sessionId: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  };

  return {
    ...sessionData,
    clearSession
  };
}
