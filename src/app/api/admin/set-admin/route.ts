import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Força o endpoint a ser dinâmico
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário atual é admin (ou se é o primeiro usuário)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // Permitir apenas se for o primeiro usuário ou se já for admin
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 1;
    const isCurrentAdmin = currentUser?.role === "ADMIN";

    if (!isFirstUser && !isCurrentAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    // Atualizar o usuário para ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({
      message: `Usuário ${updatedUser.name} foi definido como ADMIN`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Erro ao definir usuário como ADMIN:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 