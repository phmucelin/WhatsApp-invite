import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(`[CONTACTS_CLEAR] Iniciando limpeza de contatos para usuário: ${session.user.id}`);

    // Contar convidados antes da limpeza
    const guestCount = await prisma.guest.count({
      where: {
        event: { userId: session.user.id }
      }
    });

    console.log(`[CONTACTS_CLEAR] Convidados encontrados: ${guestCount}`);

    // Deleta todos os convidados dos eventos do usuário
    const deletedGuests = await prisma.guest.deleteMany({
      where: {
        event: {
          userId: session.user.id,
        },
      },
    });

    console.log(`[CONTACTS_CLEAR] Convidados deletados: ${deletedGuests.count}`);

    // Verificar se tudo foi deletado
    const remainingGuests = await prisma.guest.count({
      where: {
        event: { userId: session.user.id }
      }
    });

    console.log(`[CONTACTS_CLEAR] Convidados restantes: ${remainingGuests}`);

    return NextResponse.json({ 
      success: true, 
      deletedGuests: deletedGuests.count,
      remainingGuests
    });
  } catch (error) {
    console.error("[CONTACTS_CLEAR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
