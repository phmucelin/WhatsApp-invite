"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const router = useRouter();
  const { sessionId, isLoading, error } = useSession();

  useEffect(() => {
    if (sessionId && !isLoading) {
      // Redirecionar para dashboard após obter sessão
      router.push("/dashboard");
    }
  }, [sessionId, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{background: 'var(--whatsapp-chat-bg)'}}>
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Preparando sua sessão...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{background: 'var(--whatsapp-chat-bg)'}}>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <CardTitle className="text-3xl font-bold" style={{color: 'var(--whatsapp-green-darker)'}}>
              Erro
            </CardTitle>
            <p className="text-gray-600 mt-2">{error}</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full btn btn-primary text-lg py-3"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{background: 'var(--whatsapp-chat-bg)'}}>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
          <CardTitle className="text-3xl font-bold" style={{color: 'var(--whatsapp-green-darker)'}}>
            Chai School Convites
          </CardTitle>
          <p className="text-gray-600 mt-2">Bem-vindo ao sistema de convites!</p>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Seus dados serão salvos automaticamente durante sua sessão.
            </p>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="w-full btn btn-primary text-lg py-3"
            >
              Entrar no Sistema
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
