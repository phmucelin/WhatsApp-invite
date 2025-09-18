import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { contactId, name, phoneNumber } = body;

    if (!contactId || !name || !phoneNumber) {
      return NextResponse.json({ 
        error: "ID do contato, nome e número são obrigatórios" 
      }, { status: 400 });
    }

    // Verificar se o contato existe e pertence ao usuário
    const existingContact = await prisma.guest.findFirst({
      where: {
        id: contactId,
        event: {
          userId: session.user.id,
        },
      },
      include: {
        event: true,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ 
        error: "Contato não encontrado ou não autorizado" 
      }, { status: 404 });
    }

    // Normalizar o número de telefone para comparação
    const normalizedNewPhone = phoneNumber.trim().replace(/\D/g, "");
    const normalizedExistingPhone = existingContact.phoneNumber.replace(/\D/g, "");

    // Verificar se o novo número já existe para outro contato no mesmo evento
    if (normalizedNewPhone !== normalizedExistingPhone) {
      const duplicateContact = await prisma.guest.findFirst({
        where: {
          phoneNumber: normalizedNewPhone,
          eventId: existingContact.eventId,
          id: { not: contactId },
        },
      });

      if (duplicateContact) {
        return NextResponse.json({ 
          error: "Já existe um contato com este número neste evento" 
        }, { status: 400 });
      }
    }

    // Atualizar o contato
    const updatedContact = await prisma.guest.update({
      where: { id: contactId },
      data: {
        name: name.trim(),
        phoneNumber: normalizedNewPhone, // Usar o número já normalizado
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    });

    console.log("[CONTACTS_EDIT] Contato atualizado:", updatedContact.id);

    return NextResponse.json({
      message: "Contato atualizado com sucesso",
      contact: updatedContact,
    });
  } catch (error) {
    console.error("[CONTACTS_EDIT] Erro:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
