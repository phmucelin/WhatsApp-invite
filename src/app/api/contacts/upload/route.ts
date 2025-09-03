export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

interface CSVRecord {
  NOME: string;
  NUMERO: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const eventId = formData.get("eventId") as string;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    if (!eventId) {
      return new NextResponse("No event selected", { status: 400 });
    }

    // Verificar se o evento existe e pertence ao usuário
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    const fileContent = await file.text();
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as CSVRecord[];

    if (!Array.isArray(records) || records.length === 0) {
      return new NextResponse("Invalid CSV format", { status: 400 });
    }

    // Validar se o CSV tem as colunas necessárias
    const requiredColumns = ["NOME", "NUMERO"];
    const hasRequiredColumns = requiredColumns.every((column) =>
      Object.keys(records[0]).includes(column)
    );

    if (!hasRequiredColumns) {
      return new NextResponse("CSV must have NOME and NUMERO columns", {
        status: 400,
      });
    }

    // Processar os contatos em lote
    const contacts = records.map((record: CSVRecord) => ({
      name: record.NOME.trim(),
      phoneNumber: record.NUMERO.trim().replace(/\D/g, ""), // Remove caracteres não numéricos
      eventId: eventId,
    }));

    // Inserir contatos no banco de dados
    const result = await prisma.$transaction(
      contacts.map((contact) =>
        prisma.guest.upsert({
          where: {
            phoneNumber_eventId: {
              phoneNumber: contact.phoneNumber,
              eventId: contact.eventId,
            },
          },
          update: {
            name: contact.name,
          },
          create: {
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            eventId: contact.eventId,
          },
        })
      )
    );

    return NextResponse.json({ count: result.length });
  } catch (error) {
    console.error("[CONTACTS_UPLOAD]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
