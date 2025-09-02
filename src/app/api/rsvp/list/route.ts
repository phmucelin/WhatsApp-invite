import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[LIST_API] Listando todos os convidados");
    
    const guests = await prisma.guest.findMany({
      include: {
        event: {
          select: {
            title: true,
            date: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("[LIST_API] Convidados encontrados:", guests.length);
    
    // Retornar apenas informações seguras (sem dados sensíveis)
    const safeGuests = guests.map((guest: any) => ({
      id: guest.id,
      name: guest.name,
      eventTitle: guest.event.title,
      eventDate: guest.event.date,
      rsvpStatus: guest.rsvpStatus,
      createdAt: guest.createdAt
    }));

    return NextResponse.json({
      total: guests.length,
      guests: safeGuests,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[LIST_API] Erro:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 