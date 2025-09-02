export const dynamic = 'force-dynamic';

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import { format } from "date-fns";
import { GuestWithEvent, SendStatus } from "@/types/prisma";
import { toast } from "sonner";

type StatsRecord = {
  sendStatus: SendStatus;
  _count: number;
};

async function getMessages() {
  const response = await fetch("/api/messages");
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
}

async function getStats() {
  const response = await fetch("/api/messages/stats");
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

export default function MessagesPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [messages, setMessages] = useState<GuestWithEvent[]>([]);
  const [stats, setStats] = useState<StatsRecord[]>([]);

  const totalMessages = stats.reduce((acc: number, curr: StatsRecord) => acc + curr._count, 0);
  const sentMessages = stats.find((s: StatsRecord) => s.sendStatus === "SENT")?._count ?? 0;
  const pendingMessages = stats.find((s: StatsRecord) => s.sendStatus === "PENDING")?._count ?? 0;

  async function handleSendMessage(guestId: string) {
    try {
      setIsLoading(guestId);
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guestId }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      // Abrir o WhatsApp Web em uma nova aba
      window.open(data.whatsappUrl, "_blank");

      // Atualizar os dados
      const [newMessages, newStats] = await Promise.all([
        getMessages(),
        getStats(),
      ]);

      setMessages(newMessages);
      setStats(newStats);
      toast.success("Mensagem preparada para envio!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao preparar mensagem");
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Envios</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de Envios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalMessages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sentMessages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingMessages}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Convidados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Nenhum convidado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      {format(message.updatedAt, "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{message.event.title}</TableCell>
                    <TableCell>
                      {message.name} ({formatPhoneNumber(message.phoneNumber)})
                    </TableCell>
                    <TableCell>
                      {message.sendStatus === "SENT" ? "Enviado" : "Pendente"}
                    </TableCell>
                    <TableCell>
                      {message.sendStatus === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendMessage(message.id)}
                          disabled={isLoading === message.id}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isLoading === message.id ? "Preparando..." : "Enviar"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 