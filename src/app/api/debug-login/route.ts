import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log("=== DEBUG LOGIN ===");
    console.log("Email recebido:", email);
    console.log("Senha recebida:", password);
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("Usuário encontrado:", user ? "SIM" : "NÃO");
    
    if (!user) {
      console.log("ERRO: Usuário não encontrado");
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    console.log("Usuário:", user.name, user.email);

    // Verificar senha
    const isPasswordValid = await compare(password, user.password);
    console.log("Senha válida:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("ERRO: Senha inválida");
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    console.log("SUCESSO: Login válido");
    
    return NextResponse.json({
      success: true,
      message: "Login válido",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("ERRO GERAL:", error);
    
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

