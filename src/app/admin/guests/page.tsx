"use client";

import { useState, useEffect, useCallback } from "react";

interface Guest {
  id: string;
  name: string;
  phoneNumber: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  rsvpStatus: "WAITING" | "CONFIRMED" | "DECLINED";
  createdAt: Date;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  _count?: {
    guests: number;
  };
}

export default function AdminGuestsPage() {
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
        const guestsList = data.guests || [];
        setGuests(guestsList);
        setTotalGuests(data.total || 0);
      } else {
        console.error("Erro na resposta da API:", response.status);
        setGuests([]);
        setTotalGuests(0);
      }
    } catch (error) {
      console.error("Erro ao carregar convidados:", error);
      setGuests([]);
      setTotalGuests(0);
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
          // A API retorna um array diretamente, não um objeto com propriedade events
          setEvents(data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        setEvents([]); // Definir array vazio em caso de erro
      }
    }
    loadEventsForFilter();
  }, []);

  function getStatusColor(status: string) {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600 bg-green-100";
      case "DECLINED":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Gerenciar Convidados
          </h1>
          <p className="text-gray-600">
            Total de convidados:{" "}
            <span className="font-semibold">{totalGuests}</span>
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Filtros</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Filtro por Nome */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por Telefone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="text"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="Buscar por telefone..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por Evento */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Evento
              </label>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os eventos</option>
                {events?.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({event._count?.guests || 0} convidados)
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os status</option>
                <option value="WAITING">Aguardando</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="DECLINED">Declinado</option>
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={loadGuests}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={() => {
                setNameFilter("");
                setPhoneFilter("");
                setEventFilter("all");
                setStatusFilter("all");
                loadGuests();
              }}
              className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Lista de Convidados */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Convidados ({guests.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status RSVP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Data Criação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {guests
                    ?.filter(
                      (guest) =>
                        statusFilter === "all" ||
                        guest?.rsvpStatus === statusFilter
                    )
                    ?.map((guest) => (
                      <tr key={guest?.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {guest?.name || "N/A"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {guest?.phoneNumber || "N/A"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {guest?.eventTitle || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {guest?.eventDate ? (() => {
                              const eventDate = new Date(guest.eventDate);
                              const day = eventDate.getUTCDate().toString().padStart(2, '0');
                              const month = (eventDate.getUTCMonth() + 1).toString().padStart(2, '0');
                              const year = eventDate.getUTCFullYear();
                              const hours = eventDate.getUTCHours().toString().padStart(2, '0');
                              const minutes = eventDate.getUTCMinutes().toString().padStart(2, '0');
                              return `${day}/${month}/${year} às ${hours}:${minutes}`;
                            })() : "N/A"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(guest?.rsvpStatus)}`}
                          >
                            {getStatusText(guest?.rsvpStatus)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {guest?.createdAt ? (() => {
                            const createdAt = new Date(guest.createdAt);
                            const day = createdAt.getUTCDate().toString().padStart(2, '0');
                            const month = (createdAt.getUTCMonth() + 1).toString().padStart(2, '0');
                            const year = createdAt.getUTCFullYear();
                            return `${day}/${month}/${year}`;
                          })() : "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <a
                            href={`/rsvp/${guest?.id}`}
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
