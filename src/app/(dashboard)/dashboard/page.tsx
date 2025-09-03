"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventWithGuests, GuestStatus } from "@/types/prisma";
// import { ClearEvents } from "@/components/dashboard/clear-events";
import { DeleteEvent } from "@/components/dashboard/delete-event";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [events, setEvents] = useState<EventWithGuests[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const totalEvents = events.length;
  const totalInvites = events.reduce((acc: number, event: EventWithGuests) => acc + event._count.guests, 0);
  const totalConfirmed = events.reduce((acc: number, event: EventWithGuests) =>
    acc + event.guests.filter((guest: GuestStatus) => guest.rsvpStatus === "CONFIRMED").length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Eventos</h2>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Link>
          </Button>
          {/* <ClearEvents /> */}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalEvents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Convites Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalInvites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalConfirmed}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
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
                        {format(new Date(event.date), "PPP 'às' p", {
                          locale: ptBR,
                        })}
                      </p>
                      <p className="text-sm">
                        <strong>Local:</strong> {event.location}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <p>
                          <strong>Convidados:</strong>{" "}
                          {event._count.guests}
                        </p>
                        <p>
                          <strong>Confirmados:</strong>{" "}
                          {
                            event.guests.filter(
                              (guest: GuestStatus) => guest.rsvpStatus === "CONFIRMED"
                            ).length
                          }
                        </p>
                        <p>
                          <strong>Enviados:</strong>{" "}
                          {
                            event.guests.filter(
                              (guest: GuestStatus) => guest.sendStatus === "SENT"
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
  );
} 