import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/utils";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { guestId } = await request.json();

    if (!guestId) {
      return new NextResponse("Guest ID is required", { status: 400 });
    }

    // Buscar o convidado e o evento
    const guest = await prisma.guest.findUnique({
      where: {
        id: guestId,
        sendStatus: "PENDING",
      },
      include: {
        event: true,
      },
    });

    if (!guest) {
      return new NextResponse("Guest not found", { status: 404 });
    }

    // Verificar se o evento pertence ao usuário
    if (guest.event.userId !== session.user.id) {
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
    const phoneNumber = normalizePhoneNumber(guest.phoneNumber);
    
    // SOLUÇÃO SIMPLIFICADA: Encoding direto sem Buffer
    // 1. Aplicar encodeURIComponent para URL encoding correto
    const encodedMessage = encodeURIComponent(finalMessage);
    
    // 2. Versão alternativa com substituição de espaços por +
    const encodedMessagePlus = encodedMessage.replace(/%20/g, '+');
    
    // 3. Versão com encoding manual para debug
    const manualEncoded = finalMessage
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code < 128) return char; // ASCII básico
        return encodeURIComponent(char);
      })
      .join('');

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    const whatsappUrlPlus = `https://wa.me/${phoneNumber}?text=${encodedMessagePlus}`;
    const whatsappUrlManual = `https://wa.me/${phoneNumber}?text=${manualEncoded}`;

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
    await prisma.guest.update({
      where: { id: guest.id },
      data: { sendStatus: "SENT" },
    });

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
