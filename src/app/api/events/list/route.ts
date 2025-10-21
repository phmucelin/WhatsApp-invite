import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Temporário - retornar todos os eventos sem filtro de usuário
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
        message: true,
        imageUrl: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("[EVENTS_LIST_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}