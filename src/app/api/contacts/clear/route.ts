import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    const { eventId } = await request.json();

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

    let count = 0;
    let message = "";

    if (eventId === "all") {
      // Limpar todos os contatos de todos os eventos do usuário
      const userEvents = await prisma.event.findMany({
        where: {
          userId: userData.id,
        },
        select: {
          id: true,
        },
      });

      const eventIds = userEvents.map(event => event.id);

      count = await prisma.guest.count({
        where: {
          eventId: {
            in: eventIds,
          },
        },
      });

      await prisma.guest.deleteMany({
        where: {
          eventId: {
            in: eventIds,
          },
        },
      });

      message = `${count} contatos foram excluídos de todos os eventos`;
    } else {
      // Limpar contatos de um evento específico
      if (!eventId) {
        return NextResponse.json(
          { error: "ID do evento é obrigatório" },
          { status: 400 }
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

      // Contar quantos contatos serão excluídos
      count = await prisma.guest.count({
        where: {
          eventId: eventId,
        },
      });

      // Excluir todos os convidados do evento
      await prisma.guest.deleteMany({
        where: {
          eventId: eventId,
        },
      });

      message = `${count} contatos foram excluídos do evento "${event.title}"`;
    }

    return NextResponse.json({
      success: true,
      message: message,
      count: count,
    });

  } catch (error) {
    console.error("[CONTACTS_CLEAR]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}