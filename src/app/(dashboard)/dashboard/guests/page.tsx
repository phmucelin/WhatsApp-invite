"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { EditContact } from "@/components/forms/edit-contact";
import { Guest as PrismaGuest } from "@/types/prisma";

interface Guest extends PrismaGuest {
  eventTitle: string;
  eventDate: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalGuests, setTotalGuests] = useState(0);

  // Filtros
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadGuests = useCallback(async () => {
    try {
      setIsLoading(true);

      // Construir query string com filtros
      const params = new URLSearchParams();
      if (nameFilter) params.append("name", nameFilter);
      if (phoneFilter) params.append("phone", phoneFilter);
      if (eventFilter && eventFilter !== "all")
        params.append("eventId", eventFilter);

      const response = await fetch(`/api/rsvp/list?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setGuests(data.guests);
        setTotalGuests(data.total);
      }
    } catch (error) {
      console.error("Erro ao carregar convidados:", error);
      toast.error("Erro ao carregar convidados");
    } finally {
      setIsLoading(false);
    }
  }, [nameFilter, phoneFilter, eventFilter]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  // Carregar eventos para o filtro
  useEffect(() => {
    async function loadEventsForFilter() {
      try {
        const response = await fetch("/api/events/list");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events);
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    }
    loadEventsForFilter();
  }, []);

  function getStatusColor(status: string) {
    switch (status) {
      case "CONFIRMED":
        return "status-confirmed";
      case "DECLINED":
        return "status-declined";
      default:
        return "status-waiting";
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case "CONFIRMED":
        return "Confirmado";
      case "DECLINED":
        return "Declinado";
      default:
        return "Aguardando";
    }
  }

  function getSendStatusColor(status: string) {
    switch (status) {
      case "SENT":
        return "status-sent";
      default:
        return "status-pending";
    }
  }

  function getSendStatusText(status: string) {
    switch (status) {
      case "SENT":
        return "Enviado";
      default:
        return "Pendente";
    }
  }

  return (
    <div className="main-container">
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="page-title text-4xl font-bold mb-2">Convidados</h1>
          <p className="text-gray-600">
            Gerencie todos os convidados dos seus eventos
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Convidados</p>
                <p className="stats-number">{totalGuests}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="stats-number text-green-600">
                  {guests.filter(g => g.rsvpStatus === "CONFIRMED").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">✅</span>
              </div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensagens Enviadas</p>
                <p className="stats-number text-blue-600">
                  {guests.filter(g => g.sendStatus === "SENT").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <Input
                  placeholder="Buscar por nome..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <Input
                  placeholder="Buscar por telefone..."
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Evento</label>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os eventos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os eventos</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status RSVP</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                    <SelectItem value="DECLINED">Declinado</SelectItem>
                    <SelectItem value="WAITING">Aguardando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Convidados */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Convidados ({guests.length} de {totalGuests})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Carregando convidados...</p>
              </div>
            ) : guests.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Nenhum convidado encontrado com os filtros aplicados.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Status RSVP</TableHead>
                    <TableHead>Status Envio</TableHead>
                    <TableHead>Reenvios</TableHead>
                    <TableHead>Último Envio</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">
                        {guest.name}
                      </TableCell>
                      <TableCell>
                        {guest.phoneNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{guest.eventTitle}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(guest.eventDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`status-badge ${getStatusColor(guest.rsvpStatus)}`}>
                          {getStatusText(guest.rsvpStatus)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`status-badge ${getSendStatusColor(guest.sendStatus)}`}>
                          {getSendStatusText(guest.sendStatus)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <span className="text-lg font-bold text-orange-600">
                            {guest.resendCount || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {guest.lastSentAt ? (
                          <div className="text-sm text-gray-600">
                            {new Date(guest.lastSentAt).toLocaleDateString('pt-BR')}
                            <br />
                            {new Date(guest.lastSentAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <EditContact 
                          contact={guest} 
                          onContactUpdated={loadGuests}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
