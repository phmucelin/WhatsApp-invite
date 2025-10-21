import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "ID do evento é obrigatório" },
        { status: 400 }
      );
    }

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

    // Verificar se o evento pertence ao usuário
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: userData.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    // Excluir todos os convidados do evento primeiro
    await prisma.guest.deleteMany({
      where: {
        eventId: eventId,
      },
    });

    // Excluir o evento
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Evento e todos os convidados foram excluídos com sucesso",
    });

  } catch (error) {
    console.error("[EVENTS_DELETE]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}