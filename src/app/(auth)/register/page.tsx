"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      toast.success("Conta criada com sucesso! Faça login para continuar.");
      router.push("/login");
    } catch (error) {
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
            Criar Conta
          </CardTitle>
          <p className="text-gray-600 mt-2">Crie sua conta para começar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                disabled={isLoading}
                className="input"
                placeholder="Seu nome completo"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn btn-primary text-lg py-3" 
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium transition">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
