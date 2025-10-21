"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      console.log("Tentando fazer login com:", formData.get("email"));
      
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/dashboard",
      });
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error(error instanceof Error ? error.message : "Algo deu errado");
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-gray-600 mt-2">Faça login para acessar sua conta</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="input"
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="input"
                placeholder="Sua senha"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn btn-primary text-lg py-3" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-green-600 hover:text-green-700 font-medium transition">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
