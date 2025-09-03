"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

interface Event {
  id: string;
  title: string;
  guestCount: number;
}

interface FiltersProps {
  onFiltersChange: (filters: {
    name: string;
    phone: string;
    eventId: string;
    status: string;
    sendStatus: string;
  }) => void;
  showEventFilter?: boolean;
  showStatusFilter?: boolean;
  showPhoneFilter?: boolean;
}

export function Filters({ onFiltersChange, showEventFilter = true, showStatusFilter = true, showPhoneFilter = true }: FiltersProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sendStatusFilter, setSendStatusFilter] = useState("all");

  useEffect(() => {
    if (showEventFilter) {
      loadEvents();
    }
  }, [showEventFilter]);

  useEffect(() => {
    // Aplicar filtros automaticamente quando mudarem
    const filters = {
      name: nameFilter,
      phone: phoneFilter,
      eventId: eventFilter,
      status: statusFilter,
      sendStatus: sendStatusFilter,
    };
    onFiltersChange(filters);
  }, [nameFilter, phoneFilter, eventFilter, statusFilter, sendStatusFilter, onFiltersChange]);

  async function loadEvents() {
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

  function clearFilters() {
    setNameFilter("");
    setPhoneFilter("");
    setEventFilter("all");
    setStatusFilter("all");
    setSendStatusFilter("all");
  }

  const hasActiveFilters = nameFilter || phoneFilter || eventFilter || statusFilter || sendStatusFilter;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Filtro por Nome */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por Telefone */}
          {showPhoneFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <Input
                placeholder="Buscar por telefone..."
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
              />
            </div>
          )}

          {/* Filtro por Evento */}
          {showEventFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Evento</label>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os eventos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os eventos</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} ({event.guestCount} convidados)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro por Status RSVP */}
          {showStatusFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status RSVP</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="WAITING">Aguardando</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="DECLINED">Declinado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro por Status de Envio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status Envio</label>
            <Select value={sendStatusFilter} onValueChange={setSendStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os envios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os envios</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="SENT">Enviado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 