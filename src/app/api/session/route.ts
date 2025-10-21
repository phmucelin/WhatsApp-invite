import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Criar ou obter sessão do usuário
export async function GET() {
  try {
    const cookieStore = cookies();
    let sessionId = cookieStore.get('user-session')?.value;

    if (!sessionId) {
      // Criar nova sessão
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      cookieStore.set('user-session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 dias
      });
    }

    return NextResponse.json({
      sessionId,
      message: "Sessão criada/obtida com sucesso"
    });

  } catch (error) {
    console.error("Erro ao criar/obter sessão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Limpar sessão
export async function DELETE() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('user-session');

    return NextResponse.json({
      message: "Sessão limpa com sucesso"
    });

  } catch (error) {
    console.error("Erro ao limpar sessão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
