"use client";

import { useState, useEffect, useCallback } from "react";
import { ContactUpload } from "@/components/forms/contact-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPhoneNumber } from "@/lib/utils";
import { Guest } from "@/types/prisma";
import { ClearContacts } from "@/components/dashboard/clear-contacts";
import { Filters } from "@/components/dashboard/filters";
import { EditContact } from "@/components/forms/edit-contact";

interface FiltersType {
  name: string;
  phone: string;
  eventId: string;
  status: string;
  sendStatus: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Guest[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [stats, setStats] = useState<{
    total: number;
    sent: number;
    confirmed: number;
  }>({ total: 0, sent: 0, confirmed: 0 });

  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.guests);
        setFilteredContacts(data.guests);
        calculateStats(data.guests);
      }
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  function calculateStats(contactsList: Guest[]) {
    const totalContacts = contactsList.length;
    const sentInvites = contactsList.filter(
      (c) => c.sendStatus === "SENT"
    ).length;
    const confirmedGuests = contactsList.filter(
      (c) => c.rsvpStatus === "CONFIRMED"
    ).length;

    setStats({
      total: totalContacts,
      sent: sentInvites,
      confirmed: confirmedGuests,
    });
  }

  const handleFiltersChange = useCallback(
    (filters: FiltersType) => {
      // Atualizar o evento selecionado
      setSelectedEventId(filters.eventId);
      
      let filtered = [...contacts];

      // Filtro por nome
      if (filters.name) {
        filtered = filtered.filter((contact) =>
          contact.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }

      // Filtro por telefone
      if (filters.phone) {
        filtered = filtered.filter((contact) =>
          contact.phoneNumber.includes(filters.phone)
        );
      }

      // Filtro por evento
      if (filters.eventId && filters.eventId !== "all") {
        filtered = filtered.filter(
          (contact) => contact.eventId === filters.eventId
        );
      }

      // Filtro por status RSVP
      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter(
          (contact) => contact.rsvpStatus === filters.status
        );
      }

      // Filtro por status de envio
      if (filters.sendStatus && filters.sendStatus !== "all") {
        filtered = filtered.filter(
          (contact) => contact.sendStatus === filters.sendStatus
        );
      }

      setFilteredContacts(filtered);
      calculateStats(filtered);
    },
    [contacts]
  );

  return (
    <div className="main-container">
      <div className="container mx-auto p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="page-title text-4xl font-bold mb-2">Contatos</h2>
              <p className="text-gray-600">Importe e gerencie seus contatos para envio de mensagens</p>
            </div>
            <div className="flex items-center gap-4">
              <ContactUpload />
              {selectedEventId !== "all" && (
                <ClearContacts 
                  eventId={selectedEventId} 
                  onClear={loadContacts} 
                />
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Contatos</p>
                  <p className="stats-number">{stats.total || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">👥</span>
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Convites Enviados</p>
                  <p className="stats-number text-blue-600">{stats.sent || 0}</p>
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
                  <p className="stats-number text-green-600">{stats.confirmed || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <Filters onFiltersChange={handleFiltersChange} />

          {/* Lista de Contatos */}
          <Card>
        <CardHeader>
          <CardTitle>
            Lista de Contatos ({filteredContacts.length} de {contacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Carregando contatos...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {contacts.length === 0
                ? "Nenhum contato importado ainda."
                : "Nenhum contato encontrado com os filtros aplicados."}
            </div>
          ) : (
            <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Status do Envio</TableHead>
                      <TableHead>Status da Confirmação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {filteredContacts.map((contact: Guest) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>
                      {formatPhoneNumber(contact.phoneNumber)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          contact.sendStatus === "SENT"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {contact.sendStatus === "SENT" ? "Enviado" : "Pendente"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          contact.rsvpStatus === "CONFIRMED"
                            ? "bg-green-100 text-green-600"
                            : contact.rsvpStatus === "DECLINED"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {contact.rsvpStatus === "CONFIRMED"
                          ? "Confirmado"
                          : contact.rsvpStatus === "DECLINED"
                            ? "Declinado"
                            : "Aguardando"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <EditContact 
                        contact={contact} 
                        onContactUpdated={loadContacts}
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
    </div>
  );
}
