import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Por enquanto, retornar todos os eventos sem filtro de usuário
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}