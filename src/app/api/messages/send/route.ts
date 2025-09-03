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

    // Preparar a mensagem melhorada com emojis e informações
    const eventDate = new Date(guest.event.date).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let message = guest.event.message
      .replace("{{NOME}}", guest.name)
      .replace("{{EVENTO}}", guest.event.title)
      .replace("{{DATA}}", eventDate)
      .replace("{{LOCAL}}", guest.event.location)
      .replace(
        "{{LINK}}",
        `https://invite-whats-app.vercel.app/rsvp/${guest.id}`
      );

    // Adicionar emojis e formatação se a mensagem não tiver
    if (!message.includes("🎊") && !message.includes("📅")) {
      // Versão com emojis Unicode seguros para WhatsApp
      message = `🎊 *Convite Especial* 🎊

${message}

📅 *Data:* ${eventDate}
📍 *Local:* ${guest.event.location}

🔗 *Link do Convite:* ${`https://invite-whats-app.vercel.app/rsvp/${guest.id}`}

⭐ *Aguardo sua confirmação!* ⭐`;
    }

    // Testar diferentes versões de emojis para compatibilidade
    let finalMessage = message;
    
    // Versão 1: Emojis Unicode seguros para WhatsApp (mais compatível)
    const basicEmojis = message
      .replace(/🎊/g, "🎊")
      .replace(/📅/g, "📅")
      .replace(/📍/g, "📍")
      .replace(/🔗/g, "🔗")
      .replace(/⭐/g, "⭐");
    
    // Versão 2: Emojis alternativos (fallback)
    const alternativeEmojis = message
      .replace(/🎊/g, "🎉")
      .replace(/📅/g, "📆")
      .replace(/📍/g, "🏠")
      .replace(/🔗/g, "🔗")
      .replace(/⭐/g, "💫");
    
    // Versão 3: Símbolos ASCII (garantia de funcionamento)
    const asciiVersion = message
      .replace(/🎊/g, "***")
      .replace(/📅/g, "[DATA]")
      .replace(/📍/g, "[LOCAL]")
      .replace(/🔗/g, "[LINK]")
      .replace(/⭐/g, "***");

    // Usar a versão básica por padrão, mas logar todas para debug
    finalMessage = basicEmojis;
    
    console.log("[MESSAGE_VERSIONS]", {
      original: message,
      basic: basicEmojis,
      alternative: alternativeEmojis,
      ascii: asciiVersion
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
    
    // SOLUÇÃO SIMPLIFICADA: Encoding direto sem Buffer
    // 1. Aplicar encodeURIComponent para URL encoding correto
    let encodedMessage;
    try {
      encodedMessage = encodeURIComponent(finalMessage);
      console.log("[MESSAGES_SEND] Mensagem codificada com sucesso");
    } catch (error) {
      console.error("[MESSAGES_SEND] Erro ao codificar mensagem:", error);
      return new NextResponse("Error encoding message", { status: 500 });
    }
    
    // 2. Versão alternativa com substituição de espaços por +
    let encodedMessagePlus;
    try {
      encodedMessagePlus = encodedMessage.replace(/%20/g, '+');
      console.log("[MESSAGES_SEND] Mensagem com + criada com sucesso");
    } catch (error) {
      console.error("[MESSAGES_SEND] Erro ao criar versão com +:", error);
      encodedMessagePlus = encodedMessage; // fallback
    }
    
    // 3. Versão com encoding manual para debug
    let manualEncoded;
    try {
      manualEncoded = finalMessage
        .split('')
        .map(char => {
          const code = char.charCodeAt(0);
          if (code < 128) return char; // ASCII básico
          return encodeURIComponent(char);
        })
        .join('');
      console.log("[MESSAGES_SEND] Encoding manual criado com sucesso");
    } catch (error) {
      console.error("[MESSAGES_SEND] Erro no encoding manual:", error);
      manualEncoded = encodedMessage; // fallback
    }

    console.log("[MESSAGES_SEND] Criando URLs do WhatsApp...");
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    const whatsappUrlPlus = `https://wa.me/${phoneNumber}?text=${encodedMessagePlus}`;
    const whatsappUrlManual = `https://wa.me/${phoneNumber}?text=${manualEncoded}`;
    
    console.log("[MESSAGES_SEND] URLs criadas com sucesso");

    console.log("[WHATSAPP_ENCODING]", {
      phoneNumber,
      originalMessage: finalMessage,
      encodedMessage,
      encodedMessagePlus,
      manualEncoded,
      whatsappUrl,
      whatsappUrlPlus,
      whatsappUrlManual,
      // Debug: mostrar como cada emoji é codificado
      emojiCodes: {
        '🎊': encodeURIComponent('🎊'),
        '📅': encodeURIComponent('📅'),
        '📍': encodeURIComponent('📍'),
        '🔗': encodeURIComponent('🔗'),
        '⭐': encodeURIComponent('⭐')
      }
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
      whatsappUrlPlus,
      whatsappUrlManual,
      messageVersions: {
        basic: basicEmojis,
        alternative: alternativeEmojis,
        ascii: asciiVersion
      },
      encodingInfo: {
        originalMessage: finalMessage,
        encodedMessage,
        encodedMessagePlus,
        manualEncoded
      }
    });
  } catch (error) {
    console.error("[MESSAGES_SEND]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
