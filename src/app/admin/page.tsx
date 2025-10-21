"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-gray-600">Gerenciar o sistema de convites</p>
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