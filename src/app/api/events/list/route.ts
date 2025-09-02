import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[EVENTS_API] Listando todos os eventos");
    
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        _count: {
          select: {
            guests: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log("[EVENTS_API] Eventos encontrados:", events.length);
    
    const eventsWithGuestCount = events.map((event: {
      id: string;
      title: string;
      date: Date;
      location: string;
      _count: { guests: number };
    }) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      guestCount: event._count.guests
    }));

    return NextResponse.json({
      total: events.length,
      events: eventsWithGuestCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[EVENTS_API] Erro:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 