import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    console.log("[SEARCH_API] Busca de convidados iniciada");
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return new NextResponse("Query parameter is required", { status: 400 });
    }
    
    console.log("[SEARCH_API] Buscando por:", query);
    
    // Buscar por nome ou telefone
    const guests = await prisma.guest.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            phoneNumber: {
              contains: query
            }
          }
        ]
      },
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
      },
      take: 10 // Limitar a 10 resultados
    });

    console.log("[SEARCH_API] Convidados encontrados:", guests.length);
    
    // Retornar apenas informações seguras
    const safeGuests = guests.map((guest: {
      id: string;
      name: string;
      phoneNumber: string;
      event: { title: string; date: string };
      rsvpStatus: string;
    }) => ({
      id: guest.id,
      name: guest.name,
      phoneNumber: guest.phoneNumber,
      eventTitle: guest.event.title,
      eventDate: guest.event.date,
      rsvpStatus: guest.rsvpStatus
    }));

    return NextResponse.json({
      query,
      total: guests.length,
      guests: safeGuests,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[SEARCH_API] Erro:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 