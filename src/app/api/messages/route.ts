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

    // Buscar mensagens do usuário autenticado
    const messages = await prisma.guest.findMany({
      where: {
        event: {
          userId: userData.id,
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            message: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST() {
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

    const { guestId, isResend } = await request.json();

    // Buscar o convidado
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            location: true,
            message: true,
            userId: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Convidado não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o evento pertence ao usuário
    if (guest.event.userId !== userData.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    // Atualizar status de envio
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        sendStatus: "SENT",
        lastSentAt: new Date(),
      },
    });

    // Gerar URL do WhatsApp
    const eventDate = new Date(guest.event.date);
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Olá ${guest.name}! 🎉

Você está convidado para: ${guest.event.title}

📅 Data: ${formattedDate}
📍 Local: ${guest.event.location}

${guest.event.message || ''}

Por favor, confirme sua presença respondendo esta mensagem! 😊`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${guest.phoneNumber}?text=${encodedMessage}`;

    return NextResponse.json({ whatsappUrl });
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}