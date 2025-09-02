export const dynamic = 'force-dynamic';

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
import { prisma } from "@/lib/prisma";
import { formatPhoneNumber } from "@/lib/utils";
import { Guest, SendStatus, RsvpStatus } from "@/types/prisma";

type StatsRecord = {
  sendStatus: SendStatus;
  rsvpStatus: RsvpStatus;
  _count: number;
};

export default async function ContactsPage() {
  const contacts = await prisma.guest.findMany({
    orderBy: {
      name: "asc",
    },
    take: 10,
  });

  const stats = await prisma.guest.groupBy({
    by: ["sendStatus", "rsvpStatus"],
    _count: true,
  });

  const totalContacts = stats.reduce((acc: number, curr: { _count: number }) => acc + curr._count, 0);
  const sentInvites = stats.reduce((acc: number, curr: { sendStatus: SendStatus; _count: number }) => 
    curr.sendStatus === "SENT" ? acc + curr._count : acc, 0);
  const confirmedGuests = stats.reduce((acc: number, curr: { rsvpStatus: RsvpStatus; _count: number }) => 
    curr.rsvpStatus === "CONFIRMED" ? acc + curr._count : acc, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contatos</h2>
        <ContactUpload />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalContacts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Convites Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sentInvites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{confirmedGuests}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contatos</CardTitle>
        </CardHeader>
        <CardContent>
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
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Nenhum contato importado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact: Guest) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{formatPhoneNumber(contact.phoneNumber)}</TableCell>
                    <TableCell>
                      {contact.sendStatus === "SENT" ? "Enviado" : "Pendente"}
                    </TableCell>
                    <TableCell>
                      {contact.rsvpStatus === "CONFIRMED"
                        ? "Confirmado"
                        : contact.rsvpStatus === "DECLINED"
                        ? "Não Virá"
                        : "Aguardando"}
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