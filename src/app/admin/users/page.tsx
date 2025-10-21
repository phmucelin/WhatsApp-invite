"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Temporário - não carregar usuários até implementar novo sistema
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuários</h1>
        <p className="text-gray-600">Gerenciar usuários do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            O sistema de autenticação está sendo reconstruído. 
            Esta página será atualizada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}