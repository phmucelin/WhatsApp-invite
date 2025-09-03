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

    const stats = await prisma.guest.groupBy({
      by: ["sendStatus"],
      where: {
        event: {
          userId: session.user.id,
        },
      },
      _count: true,
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[MESSAGES_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
