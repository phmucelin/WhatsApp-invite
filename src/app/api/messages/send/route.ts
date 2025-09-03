export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/utils";

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
      message = `🎊 *Convite Especial* 🎊

${message}

📅 *Data:* ${eventDate}
📍 *Local:* ${guest.event.location}

🔗 *Link do Convite:* ${`https://invite-whats-app.vercel.app/rsvp/${guest.id}`}

⭐ *Aguardo sua confirmação!* ⭐`;
    }

    // Versões alternativas de emojis (comentadas para uso futuro)
    // Para usar versão com emojis simples, descomente as linhas abaixo:
    /*
    const simpleEmojiMessage = message
      .replace(/🎊/g, "🎊")
      .replace(/📅/g, "📅")
      .replace(/📍/g, "📍")
      .replace(/🔗/g, "🔗")
      .replace(/⭐/g, "⭐");
    message = simpleEmojiMessage;
    */

    // Para usar versão com emojis básicos, descomente as linhas abaixo:
    /*
    const basicEmojiMessage = message
      .replace(/🎊/g, "🎊")
      .replace(/📅/g, "📆")
      .replace(/📍/g, "🏠")
      .replace(/🔗/g, "🔗")
      .replace(/⭐/g, "💫");
    message = basicEmojiMessage;
    */

    // Para usar versão ASCII (sem emojis), descomente as linhas abaixo:
    /*
    const asciiMessage = message
      .replace(/🎊/g, "***")
      .replace(/📅/g, "[DATA]")
      .replace(/📍/g, "[LOCAL]")
      .replace(/🔗/g, "[LINK]")
      .replace(/⭐/g, "***");
    message = asciiMessage;
    */

    // Gerar o link do WhatsApp Web
    const phoneNumber = normalizePhoneNumber(guest.phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    console.log("[WHATSAPP_URL]", {
      phoneNumber,
      message,
      whatsappUrl,
    });

    // Atualizar o status do envio
    await prisma.guest.update({
      where: { id: guest.id },
      data: { sendStatus: "SENT" },
    });

    return NextResponse.json({ whatsappUrl });
  } catch (error) {
    console.error("[MESSAGES_SEND]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
