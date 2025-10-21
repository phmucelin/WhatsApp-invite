import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Temporário - retornar estatísticas básicas
    const totalMessages = await prisma.guest.count();
    const sentMessages = await prisma.guest.count({
      where: { sendStatus: "SENT" }
    });
    const pendingMessages = await prisma.guest.count({
      where: { sendStatus: "PENDING" }
    });

    return NextResponse.json({
      totalMessages,
      sentMessages,
      pendingMessages,
    });
  } catch (error) {
    console.error("[MESSAGES_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}