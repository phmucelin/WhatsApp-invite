export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    console.log("[LIST_API] Listando convidados com filtros");

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name")?.toLowerCase();
    const phone = searchParams.get("phone");
    const eventId = searchParams.get("eventId");
    const eventTitle = searchParams.get("eventTitle")?.toLowerCase();

    console.log("[LIST_API] Filtros aplicados:", {
      name,
      phone,
      eventId,
      eventTitle,
    });

    // Construir filtros dinamicamente
    const where: {
      name?: { contains: string; mode: "insensitive" };
      phoneNumber?: { contains: string };
      eventId?: string;
      event?: { title: { contains: string; mode: "insensitive" } };
    } = {};

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (phone) {
      where.phoneNumber = {
        contains: phone,
      };
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (eventTitle) {
      where.event = {
        title: {
          contains: eventTitle,
          mode: "insensitive",
        },
      };
    }

    const guests = await prisma.guest.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("[LIST_API] Convidados encontrados:", guests.length);

    // Retornar apenas informações seguras (sem dados sensíveis)
    const safeGuests = guests.map(
      (guest: {
        id: string;
        name: string;
        phoneNumber: string;
        eventId: string;
        event: { id: string; title: string; date: Date };
        rsvpStatus: string;
        createdAt: Date;
      }) => ({
        id: guest.id,
        name: guest.name,
        phoneNumber: guest.phoneNumber,
        eventId: guest.event.id,
        eventTitle: guest.event.title,
        eventDate: guest.event.date,
        rsvpStatus: guest.rsvpStatus,
        createdAt: guest.createdAt,
      })
    );

    return NextResponse.json({
      total: guests.length,
      filters: { name, phone, eventId, eventTitle },
      guests: safeGuests,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[LIST_API] Erro:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
