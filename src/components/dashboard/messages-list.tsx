"use client";

import { useState, useEffect, useCallback } from "react";
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
import { GuestWithEvent, SendStatus } from "@/types/prisma";
import { toast } from "sonner";
import { Filters } from "@/components/dashboard/filters";

type StatsRecord = {
  sendStatus: SendStatus;
  _count: number;
};

async function getMessages() {
  const response = await fetch("/api/messages");
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}

async function getStats() {
  const response = await fetch("/api/messages/stats");
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}

export function MessagesList() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [messages, setMessages] = useState<GuestWithEvent[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<GuestWithEvent[]>(
    []
  );
  const [stats, setStats] = useState<StatsRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoadingData(true);
      const [messages, stats] = await Promise.all([getMessages(), getStats()]);
      setMessages(messages);
      setFilteredMessages(messages);
      setStats(stats);
    } catch (error) {
      console.error("[LOAD_DATA]", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoadingData(false);
    }
  }

  const handleFiltersChange = useCallback(
    (filters: {
      name: string;
      phone: string;
      eventId: string;
      status: string;
      sendStatus: string;
    }) => {
      let filtered = [...messages];

      // Filtro por nome
      if (filters.name) {
        filtered = filtered.filter((message) =>
          message.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }

      // Filtro por telefone
      if (filters.phone) {
        filtered = filtered.filter((message) =>
          message.phoneNumber.includes(filters.phone)
        );
      }

      // Filtro por evento
      if (filters.eventId && filters.eventId !== "all") {
        filtered = filtered.filter(
          (message) => message.eventId === filters.eventId
        );
      }

      // Filtro por status RSVP
      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter(
          (message) => message.rsvpStatus === filters.status
        );
      }

      // Filtro por status de envio
      if (filters.sendStatus && filters.sendStatus !== "all") {
        filtered = filtered.filter(
          (message) => message.sendStatus === filters.sendStatus
        );
      }

      setFilteredMessages(filtered);
    },
    [messages]
  );

  const totalMessages = stats.reduce(
    (acc: number, curr: StatsRecord) => acc + curr._count,
    0
  );
  const sentMessages =
    stats.find((s: StatsRecord) => s.sendStatus === "SENT")?._count ?? 0;
  const pendingMessages =
    stats.find((s: StatsRecord) => s.sendStatus === "PENDING")?._count ?? 0;

  async function handleSendMessage(guestId: string) {
    try {
      setIsLoading(guestId);
      console.log("[SEND_MESSAGE] Iniciando envio para:", guestId);

      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guestId }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      console.log("[SEND_MESSAGE] URL gerada:", data.whatsappUrl);

      // Abrir o WhatsApp Web em uma nova aba
      const newWindow = window.open(data.whatsappUrl, "_blank");
      if (!newWindow) {
        throw new Error(
          "O navegador bloqueou a abertura da nova aba. Por favor, permita popups para este site."
        );
      }

      // Atualizar os dados
      await loadData();
      toast.success("Mensagem preparada para envio!");
    } catch (error) {
      console.error("[SEND_MESSAGE]", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao preparar mensagem"
      );
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Mensagens</h2>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalMessages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{sentMessages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {pendingMessages}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Filters onFiltersChange={handleFiltersChange} />

      {/* Lista de Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Mensagens ({filteredMessages.length} de {messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Carregando mensagens...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {messages.length === 0
                ? "Nenhuma mensagem encontrada."
                : "Nenhuma mensagem encontrada com os filtros aplicados."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Status do Envio</TableHead>
                  <TableHead>Status da Confirmação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">
                      {message.name}
                    </TableCell>
                    <TableCell>
                      {formatPhoneNumber(message.phoneNumber)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{message.event.title}</p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const eventDate = new Date(message.event.date);
                            const day = eventDate.getUTCDate().toString().padStart(2, '0');
                            const month = (eventDate.getUTCMonth() + 1).toString().padStart(2, '0');
                            const year = eventDate.getUTCFullYear();
                            const hours = eventDate.getUTCHours().toString().padStart(2, '0');
                            const minutes = eventDate.getUTCMinutes().toString().padStart(2, '0');
                            return `${day}/${month}/${year} às ${hours}:${minutes}`;
                          })()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          message.sendStatus === "SENT"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {message.sendStatus === "SENT" ? "Enviado" : "Pendente"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          message.rsvpStatus === "CONFIRMED"
                            ? "bg-green-100 text-green-600"
                            : message.rsvpStatus === "DECLINED"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {message.rsvpStatus === "CONFIRMED"
                          ? "Confirmado"
                          : message.rsvpStatus === "DECLINED"
                            ? "Declinado"
                            : "Aguardando"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage(message.id)}
                        disabled={
                          isLoading === message.id ||
                          message.sendStatus === "SENT"
                        }
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {isLoading === message.id ? "Enviando..." : "Enviar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
