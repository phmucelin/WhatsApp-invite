import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(`[EVENTS_API] Listando eventos para usuário: ${session.user.id}`);

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id, // Filtra apenas eventos do usuário logado
      },
      include: {
        _count: {
          select: {
            guests: true,
          },
        },
        guests: {
          select: {
            sendStatus: true,
            rsvpStatus: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    console.log(`[EVENTS_API] Eventos encontrados para usuário ${session.user.id}:`, events.length);

    return NextResponse.json({
      total: events.length,
      events: events,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[EVENTS_API] Erro:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
