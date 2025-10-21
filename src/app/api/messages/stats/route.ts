import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verificar autenticação
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Decodificar token
    let userData;
    try {
      const tokenData = JSON.parse(Buffer.from(authToken.value, 'base64').toString());
      userData = tokenData;
    } catch (error) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    // Buscar estatísticas do usuário autenticado
    const stats = await prisma.guest.groupBy({
      by: ['sendStatus'],
      where: {
        event: {
          userId: userData.id,
        },
      },
      _count: {
        sendStatus: true,
      },
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[MESSAGES_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
