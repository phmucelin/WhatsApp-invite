import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    console.log("[REGISTER] Iniciando registro...");
    const json = await request.json();
    console.log("[REGISTER] Dados recebidos:", { ...json, password: "[REDACTED]" });
    
    const body = registerSchema.parse(json);
    console.log("[REGISTER] Dados validados");

    // Verifica se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });
    console.log("[REGISTER] Verificação de email existente:", { exists: !!existingUser });

    if (existingUser) {
      return new NextResponse("Email já está em uso", { status: 400 });
    }

    const hashedPassword = await hash(body.password, 10);
    console.log("[REGISTER] Senha criptografada");

    console.log("[REGISTER] Tentando criar usuário no banco...");
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });
    console.log("[REGISTER] Usuário criado com sucesso:", { id: user.id });

    const { password: _, ...result } = user;
    return NextResponse.json(result);
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    
    if (error instanceof z.ZodError) {
      const message = error.errors[0].message;
      console.log("[REGISTER] Erro de validação:", message);
      return new NextResponse(message, { status: 400 });
    }

    if (error instanceof Error) {
      console.log("[REGISTER] Erro específico:", error.message);
      return new NextResponse(error.message, { status: 500 });
    }

    console.log("[REGISTER] Erro desconhecido");
    return new NextResponse(
      "Algo deu errado ao criar sua conta. Tente novamente.",
      { status: 500 }
    );
  }
} 