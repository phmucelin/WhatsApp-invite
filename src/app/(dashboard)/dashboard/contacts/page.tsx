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
  const [stats, setStats] = useState<{
    total: number;
    sent: number;
    confirmed: number;
  }>({ total: 0, sent: 0, confirmed: 0 });

  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/rsvp/list");
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
    const sentInvites = contactsList.filter(c => c.sendStatus === "SENT").length;
    const confirmedGuests = contactsList.filter(c => c.rsvpStatus === "CONFIRMED").length;
    
    setStats({
      total: totalContacts,
      sent: sentInvites,
      confirmed: confirmedGuests
    });
  }

  function handleFiltersChange(filters: FiltersType) {
    let filtered = [...contacts];

    // Filtro por nome
    if (filters.name) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filtro por telefone
    if (filters.phone) {
      filtered = filtered.filter(contact => 
        contact.phoneNumber.includes(filters.phone)
      );
    }

    // Filtro por evento
    if (filters.eventId) {
      filtered = filtered.filter(contact => 
        contact.eventId === filters.eventId
      );
    }

    // Filtro por status RSVP
    if (filters.status) {
      filtered = filtered.filter(contact => 
        contact.rsvpStatus === filters.status
      );
    }

    // Filtro por status de envio
    if (filters.sendStatus) {
      filtered = filtered.filter(contact => 
        contact.sendStatus === filters.sendStatus
      );
    }

    setFilteredContacts(filtered);
    calculateStats(filtered);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contatos</h2>
        <div className="flex items-center gap-4">
          <ContactUpload />
          <ClearContacts />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Convites Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.sent || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.confirmed || 0}</p>
          </CardContent>
        </Card>
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando contatos...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {contacts.length === 0 ? "Nenhum contato importado ainda." : "Nenhum contato encontrado com os filtros aplicados."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Status do Envio</TableHead>
                  <TableHead>Status da Confirmação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact: Guest) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{formatPhoneNumber(contact.phoneNumber)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.sendStatus === "SENT" 
                          ? "text-green-600 bg-green-100" 
                          : "text-yellow-600 bg-yellow-100"
                      }`}>
                        {contact.sendStatus === "SENT" ? "Enviado" : "Pendente"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.rsvpStatus === "CONFIRMED" 
                          ? "text-green-600 bg-green-100"
                          : contact.rsvpStatus === "DECLINED"
                          ? "text-red-600 bg-red-100"
                          : "text-yellow-600 bg-yellow-100"
                      }`}>
                        {contact.rsvpStatus === "CONFIRMED" ? "Confirmado" : 
                         contact.rsvpStatus === "DECLINED" ? "Declinado" : "Aguardando"}
                      </span>
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