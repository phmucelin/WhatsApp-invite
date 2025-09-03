export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = await request.json();

    if (!eventId) {
      return new NextResponse("Event ID is required", { status: 400 });
    }

    // Verificar se o evento pertence ao usuário
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            guests: true,
          },
        },
      },
    });

    if (!event) {
      return new NextResponse("Event not found or unauthorized", { status: 404 });
    }

    console.log(`[DELETE_EVENT] Deletando evento ${event.title} com ${event._count.guests} convidados`);

    // Deletar o evento e todos os convidados em uma transação
    await prisma.$transaction(async (tx: any) => {
      // Primeiro deletar todos os convidados
      await tx.guest.deleteMany({
        where: {
          eventId: eventId,
        },
      });

      // Depois deletar o evento
      await tx.event.delete({
        where: {
          id: eventId,
        },
      });
    });

    console.log(`[DELETE_EVENT] Evento ${event.title} deletado com sucesso`);

    return NextResponse.json({
      message: "Event deleted successfully",
      deletedGuests: event._count.guests,
    });
  } catch (error) {
    console.error("[DELETE_EVENT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 