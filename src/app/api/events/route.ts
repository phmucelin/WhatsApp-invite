import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('user-session')?.value;

    if (!sessionId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: {
        userId: sessionId, // Usar sessionId como userId
      },
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
