import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { guestId, isResend } = await request.json();

    if (!guestId) {
      return NextResponse.json(
        { error: "ID do convidado é obrigatório" },
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

    // Buscar dados do convidado
    const guest = await prisma.guest.findFirst({
      where: {
        id: guestId,
        event: {
          userId: userData.id,
        },
      },
      include: {
        event: true,
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Convidado não encontrado" },
        { status: 404 }
      );
    }

    // Gerar mensagem personalizada
    const eventDate = new Date(guest.event.date);
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Olá ${guest.name}! 🎉

Você está convidado(a) para o evento: *${guest.event.title}*

📅 Data: ${formattedDate}
📍 Local: ${guest.event.location}

Para confirmar sua presença, clique no link abaixo:
https://chaischool-convites.vercel.app/rsvp/${guest.id}

Esperamos você! 🎊`;

    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Limpar número de telefone (remover caracteres não numéricos)
    const cleanPhone = guest.phoneNumber.replace(/\D/g, '');
    
    // Adicionar código do país se necessário (assumindo Brasil)
    const phoneWithCountryCode = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    // Gerar link do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodedMessage}`;

    console.log("[MESSAGES_SEND] Dados:", {
      guestId,
      guestName: guest.name,
      phoneNumber: guest.phoneNumber,
      cleanPhone,
      phoneWithCountryCode,
      whatsappUrl: whatsappUrl.substring(0, 100) + "..."
    });

    // Atualizar status do convidado
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        sendStatus: "SENT",
        lastSentAt: new Date(),
        resendCount: isResend ? guest.resendCount + 1 : guest.resendCount,
      },
    });

    return NextResponse.json({
      success: true,
      whatsappUrl,
      message: "Link do WhatsApp gerado com sucesso!",
    });

  } catch (error) {
    console.error("[MESSAGES_SEND_POST]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}