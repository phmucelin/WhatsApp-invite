import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar todos os convidados dos eventos do usuário
    const guests = await prisma.guest.findMany({
      where: {
        event: {
          userId: session.user.id,
        },
      },
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

    console.log("[CONTACTS_API] Convidados encontrados:", guests.length);

    return NextResponse.json({
      total: guests.length,
      guests: guests,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CONTACTS_API] Erro:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
