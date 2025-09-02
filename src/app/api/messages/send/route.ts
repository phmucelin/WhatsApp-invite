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

    // Preparar a mensagem
    const message = guest.event.message
      .replace("{{NOME}}", guest.name)
      .replace("{{EVENTO}}", guest.event.title)
      .replace(
        "{{LINK}}",
        `${process.env.NEXTAUTH_URL}/rsvp/${guest.id}`
      );

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