import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");

  try {
    // Limpa o banco de dados
    await prisma.guest.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    console.log("Banco de dados limpo");

    // Cria usuário de teste
    const hashedPassword = await hash("123456", 10);
    
    const testUser = await prisma.user.create({
      data: {
        name: "Usuário Teste",
        email: "teste@chaischool.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Usuário de teste criado:", testUser.email);
    console.log("Senha: 123456");
  } catch (error) {
    console.error("Erro durante o seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
