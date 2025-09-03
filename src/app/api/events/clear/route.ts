export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(`[EVENTS_CLEAR] Iniciando limpeza para usuário: ${session.user.id}`);

    // Contar eventos e convidados antes da limpeza
    const eventCount = await prisma.event.count({
      where: { userId: session.user.id }
    });
    
    const guestCount = await prisma.guest.count({
      where: {
        event: { userId: session.user.id }
      }
    });

    console.log(`[EVENTS_CLEAR] Eventos encontrados: ${eventCount}, Convidados: ${guestCount}`);

    // Primeiro deleta os convidados dos eventos do usuário
    const deletedGuests = await prisma.guest.deleteMany({
      where: {
        event: {
          userId: session.user.id,
        },
      },
    });

    console.log(`[EVENTS_CLEAR] Convidados deletados: ${deletedGuests.count}`);

    // Depois deleta os eventos
    const deletedEvents = await prisma.event.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    console.log(`[EVENTS_CLEAR] Eventos deletados: ${deletedEvents.count}`);

    // Verificar se tudo foi deletado
    const remainingEvents = await prisma.event.count({
      where: { userId: session.user.id }
    });
    
    const remainingGuests = await prisma.guest.count({
      where: {
        event: { userId: session.user.id }
      }
    });

    console.log(`[EVENTS_CLEAR] Eventos restantes: ${remainingEvents}, Convidados restantes: ${remainingGuests}`);

    return NextResponse.json({ 
      success: true, 
      deletedEvents: deletedEvents.count,
      deletedGuests: deletedGuests.count,
      remainingEvents,
      remainingGuests
    });
  } catch (error) {
    console.error("[EVENTS_CLEAR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
