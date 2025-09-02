"use client";

import { useState, useEffect, useCallback } from "react";

interface Guest {
  id: string;
  name: string;
  phoneNumber: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  rsvpStatus: "WAITING" | "CONFIRMED" | "DECLINED";
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  guestCount: number;
}

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalGuests, setTotalGuests] = useState(0);
  
  // Filtros
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadGuests = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Construir query string com filtros
      const params = new URLSearchParams();
      if (nameFilter) params.append("name", nameFilter);
      if (phoneFilter) params.append("phone", phoneFilter);
      if (eventFilter) params.append("eventId", eventFilter);
      
      const response = await fetch(`/api/rsvp/list?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setGuests(data.guests);
        setTotalGuests(data.total);
      }
    } catch (error) {
      console.error("Erro ao carregar convidados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [nameFilter, phoneFilter, eventFilter]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

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

  function handleFilterChange() {
    loadGuests();
  }

  function clearFilters() {
    setNameFilter("");
    setPhoneFilter("");
    setEventFilter("");
    setStatusFilter("");
    loadGuests();
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "CONFIRMED": return "text-green-600 bg-green-100";
      case "DECLINED": return "text-red-600 bg-red-100";
      default: return "text-yellow-600 bg-yellow-100";
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case "CONFIRMED": return "Confirmado";
      case "DECLINED": return "Declinado";
      default: return "Aguardando";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Convidados
          </h1>
          <p className="text-gray-600">
            Total de convidados: <span className="font-semibold">{totalGuests}</span>
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="Buscar por telefone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por Evento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evento
              </label>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os eventos</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({event.guestCount} convidados)
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="WAITING">Aguardando</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="DECLINED">Declinado</option>
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleFilterChange}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Lista de Convidados */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Convidados ({guests.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando convidados...</p>
            </div>
          ) : guests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhum convidado encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status RSVP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Criação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guests
                    .filter(guest => !statusFilter || guest.rsvpStatus === statusFilter)
                    .map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {guest.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {guest.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {guest.eventTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(guest.eventDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(guest.rsvpStatus)}`}>
                          {getStatusText(guest.rsvpStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(guest.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`/rsvp/${guest.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver Convite
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 