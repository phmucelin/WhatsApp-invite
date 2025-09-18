"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { EventWithGuests, GuestStatus } from "@/types/prisma";
import { ClearEvents } from "@/components/dashboard/clear-events";
import { ClearContacts } from "@/components/dashboard/clear-contacts";
import { DeleteEvent } from "@/components/dashboard/delete-event";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [events, setEvents] = useState<EventWithGuests[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events/list");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast.error("Erro ao carregar eventos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const totalEvents = events.length;
  const totalInvites = events.reduce(
    (acc: number, event: EventWithGuests) => acc + event._count.guests,
    0
  );
  const totalConfirmed = events.reduce(
    (acc: number, event: EventWithGuests) =>
      acc +
      event.guests.filter(
        (guest: GuestStatus) => guest.rsvpStatus === "CONFIRMED"
      ).length,
    0
  );

  return (
    <div className="main-container">
      <div className="container mx-auto p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="page-title text-4xl font-bold">Eventos</h2>
            <div className="flex items-center gap-4">
              <Button asChild className="btn btn-primary">
                <Link href="/dashboard/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Evento
                </Link>
              </Button>
              <ClearEvents onClear={fetchEvents} />
              <ClearContacts onClear={fetchEvents} />
            </div>
          </div>
          
          {/* Estatísticas */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                  <p className="stats-number">{totalEvents}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📅</span>
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Convites Enviados</p>
                  <p className="stats-number text-blue-600">{totalInvites}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📤</span>
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmações</p>
                  <p className="stats-number text-green-600">{totalConfirmed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✅</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lista de Eventos */}
          <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
        </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Carregando eventos...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  Nenhum evento criado ainda.
                </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{event.title}</CardTitle>
                    <DeleteEvent
                      eventId={event.id}
                      eventTitle={event.title}
                      guestCount={event._count.guests}
                      onDelete={fetchEvents}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                      <p className="text-sm">
                        <strong>Data:</strong>{" "}
                        {(() => {
                          const eventDate = new Date(event.date);
                          const weekdays = [
                            "domingo", "segunda-feira", "terça-feira", "quarta-feira", 
                            "quinta-feira", "sexta-feira", "sábado"
                          ];
                          
                          const months = [
                            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
                            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
                          ];
                          
                          // Usar métodos UTC para evitar problemas de fuso horário
                          const weekday = weekdays[eventDate.getUTCDay()];
                          const day = eventDate.getUTCDate();
                          const month = months[eventDate.getUTCMonth()];
                          const year = eventDate.getUTCFullYear();
                          const hours = eventDate.getUTCHours().toString().padStart(2, '0');
                          const minutes = eventDate.getUTCMinutes().toString().padStart(2, '0');
                          
                          return `${weekday}, ${day} de ${month} de ${year} às ${hours}:${minutes}`;
                        })()}
                      </p>
                      <p className="text-sm">
                        <strong>Local:</strong> {event.location}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <p>
                          <strong>Convidados:</strong> {event._count.guests}
                        </p>
                        <p>
                          <strong>Confirmados:</strong>{" "}
                          {
                            event.guests.filter(
                              (guest: GuestStatus) =>
                                guest.rsvpStatus === "CONFIRMED"
                            ).length
                          }
                        </p>
                        <p>
                          <strong>Enviados:</strong>{" "}
                          {
                            event.guests.filter(
                              (guest: GuestStatus) =>
                                guest.sendStatus === "SENT"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
