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
      _count: true,
    });

    // Formatar resposta para o formato esperado
    const formattedStats = stats.map(stat => ({
      sendStatus: stat.sendStatus,
      _count: stat._count
    }));

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error("[MESSAGES_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
