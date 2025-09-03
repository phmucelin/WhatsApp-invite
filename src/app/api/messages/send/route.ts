import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/utils";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log("[MESSAGES_SEND] Iniciando requisição");
    
    const session = await getServerSession(authOptions);
    console.log("[MESSAGES_SEND] Session:", session?.user?.id);

    if (!session?.user) {
      console.log("[MESSAGES_SEND] Usuário não autenticado");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    console.log("[MESSAGES_SEND] Body recebido:", body);
    
    const { guestId } = body;

    if (!guestId) {
      console.log("[MESSAGES_SEND] Guest ID não fornecido");
      return new NextResponse("Guest ID is required", { status: 400 });
    }

    console.log("[MESSAGES_SEND] Buscando guest:", guestId);

    // Buscar o convidado e o evento
    const guest = await prisma.guest.findUnique({
      where: {
        id: guestId,
      },
      include: {
        event: true,
      },
    });

    console.log("[MESSAGES_SEND] Guest encontrado:", guest ? "sim" : "não");

    if (!guest) {
      console.log("[MESSAGES_SEND] Guest não encontrado");
      return new NextResponse("Guest not found", { status: 404 });
    }

    console.log("[MESSAGES_SEND] Evento:", guest.event?.title);
    console.log("[MESSAGES_SEND] Evento userId:", guest.event?.userId);
    console.log("[MESSAGES_SEND] Session userId:", session.user.id);

    // Verificar se o evento pertence ao usuário
    if (guest.event.userId !== session.user.id) {
      console.log("[MESSAGES_SEND] Usuário não autorizado para este evento");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Preparar a mensagem melhorada com formatação correta de data
    const eventDate = new Date(guest.event.date);
    
    // Formatação manual usando o horário exato como foi salvo
    const weekdays = [
      "domingo", "segunda-feira", "terça-feira", "quarta-feira", 
      "quinta-feira", "sexta-feira", "sábado"
    ];
    
    const months = [
      "janeiro", "fevereiro", "março", "abril",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    // Usar métodos UTC para evitar problemas de fuso horário
    const weekday = weekdays[eventDate.getUTCDay()];
    const day = eventDate.getUTCDate();
    const month = months[eventDate.getUTCMonth()];
    const year = eventDate.getUTCFullYear();
    const hours = eventDate.getUTCHours().toString().padStart(2, '0');
    const minutes = eventDate.getUTCMinutes().toString().padStart(2, '0');
    
    const formattedDate = `${weekday}, ${day} de ${month} de ${year} às ${hours}:${minutes}`;
    
    console.log("[MESSAGES_SEND] Data original do banco:", guest.event.date);
    console.log("[MESSAGES_SEND] Data parseada:", eventDate);
    console.log("[MESSAGES_SEND] Data formatada:", formattedDate);
    console.log("[MESSAGES_SEND] Horário extraído:", `${hours}:${minutes}`);

    let message = guest.event.message
      .replace("{{NOME}}", guest.name)
      .replace("{{EVENTO}}", guest.event.title)
      .replace("{{DATA}}", formattedDate)
      .replace("{{LOCAL}}", guest.event.location)
      .replace(
        "{{LINK}}",
        `https://invite-whats-app.vercel.app/rsvp/${guest.id}`
      );

    // Adicionar formatação calorosa se a mensagem não tiver
    if (!message.includes("Convite Especial") && !message.includes("Data:")) {
      message = `*Convite Especial* 

${message}

*Data:* ${formattedDate}
*Local:* ${guest.event.location}

*Link do Convite:* ${`https://invite-whats-app.vercel.app/rsvp/${guest.id}`}

*Estou ansioso(a) para sua confirmação! Será um prazer ter você conosco!*`;
    }

    // Usar a mensagem original sem emojis
    const finalMessage = message;
    
    console.log("[MESSAGE_VERSIONS]", {
      original: message,
      final: finalMessage
    });

    // Gerar o link do WhatsApp Web com encoding robusto
    console.log("[MESSAGES_SEND] Phone number original:", guest.phoneNumber);
    
    let phoneNumber;
    try {
      phoneNumber = normalizePhoneNumber(guest.phoneNumber);
      console.log("[MESSAGES_SEND] Phone number normalizado:", phoneNumber);
    } catch (error) {
      console.error("[MESSAGES_SEND] Erro ao normalizar telefone:", error);
      return new NextResponse("Invalid phone number", { status: 400 });
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      console.error("[MESSAGES_SEND] Telefone inválido após normalização:", phoneNumber);
      return new NextResponse("Invalid phone number format", { status: 400 });
    }
    
    // Encoding simples e direto
    let encodedMessage;
    try {
      encodedMessage = encodeURIComponent(finalMessage);
      console.log("[MESSAGES_SEND] Mensagem codificada com sucesso");
    } catch (error) {
      console.error("[MESSAGES_SEND] Erro ao codificar mensagem:", error);
      return new NextResponse("Error encoding message", { status: 500 });
    }

    console.log("[MESSAGES_SEND] Criando URL do WhatsApp...");
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    console.log("[MESSAGES_SEND] URL criada com sucesso");

    console.log("[WHATSAPP_ENCODING]", {
      phoneNumber,
      originalMessage: finalMessage,
      encodedMessage,
      whatsappUrl
    });

    // Atualizar o status do envio
    console.log("[MESSAGES_SEND] Atualizando status do guest para SENT...");
    try {
      await prisma.guest.update({
        where: { id: guest.id },
        data: { sendStatus: "SENT" },
      });
      console.log("[MESSAGES_SEND] Status atualizado com sucesso");
    } catch (error) {
      console.error("[MESSAGES_SEND] Erro ao atualizar status:", error);
      // Não falha a operação por causa disso, apenas loga o erro
    }

    return NextResponse.json({ 
      whatsappUrl,
      messageInfo: {
        originalMessage: finalMessage,
        finalMessage: finalMessage
      },
      encodingInfo: {
        originalMessage: finalMessage,
        encodedMessage
      }
    });
  } catch (error) {
    console.error("[MESSAGES_SEND]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
