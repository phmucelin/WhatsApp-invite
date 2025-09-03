import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[EVENTS_API] Listando todos os eventos");
    
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: {
            guests: true
          }
        },
        guests: {
          select: {
            sendStatus: true,
            rsvpStatus: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log("[EVENTS_API] Eventos encontrados:", events.length);
    
    return NextResponse.json({
      total: events.length,
      events: events,
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