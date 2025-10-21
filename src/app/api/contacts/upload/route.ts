import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const eventId = formData.get("eventId") as string;

    if (!file || !eventId) {
      return NextResponse.json(
        { error: "Arquivo e evento são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o evento pertence ao usuário
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: userData.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    // Ler o arquivo CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados" },
        { status: 400 }
      );
    }

    // Processar cabeçalho
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = header.findIndex(h => h.includes('nome') || h.includes('name'));
    const phoneIndex = header.findIndex(h => h.includes('telefone') || h.includes('phone') || h.includes('celular'));

    if (nameIndex === -1 || phoneIndex === -1) {
      return NextResponse.json(
        { error: "CSV deve ter colunas 'nome' e 'telefone'" },
        { status: 400 }
      );
    }

    // Processar dados
    const contacts = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const name = values[nameIndex];
        const phone = values[phoneIndex];

        if (!name || !phone) {
          errorCount++;
          continue;
        }

        // Limpar número de telefone (remover caracteres especiais)
        const cleanPhone = phone.replace(/\D/g, '');

        // Verificar se já existe
        const existingGuest = await prisma.guest.findFirst({
          where: {
            eventId: eventId,
            phoneNumber: cleanPhone,
          },
        });

        if (existingGuest) {
          errorCount++;
          continue;
        }

        // Criar convidado
        await prisma.guest.create({
          data: {
            name,
            phoneNumber: cleanPhone,
            eventId: eventId,
            rsvpStatus: "WAITING",
            sendStatus: "PENDING",
          },
        });

        successCount++;
      } catch (error) {
        console.error(`Erro ao processar linha ${i + 1}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      errors: errorCount,
      message: `${successCount} contatos importados com sucesso${errorCount > 0 ? `, ${errorCount} erros encontrados` : ''}`,
    });

  } catch (error) {
    console.error("[CONTACTS_UPLOAD]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}