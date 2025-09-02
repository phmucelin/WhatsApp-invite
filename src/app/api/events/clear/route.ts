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

    // Primeiro deleta os convidados dos eventos do usuário
    await prisma.guest.deleteMany({
      where: {
        event: {
          userId: session.user.id,
        },
      },
    });

    // Depois deleta os eventos
    await prisma.event.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EVENTS_CLEAR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 