import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Usuário ${user.name} (${user.email}) foi definido como ADMIN`);
  } catch (error) {
    console.error(`❌ Erro ao definir usuário como ADMIN:`, error);
  }
}

// Exemplo de uso
async function main() {
  // Substitua pelo email do usuário que você quer tornar ADMIN
  await setAdmin("admin@chaischool.com");
  
  await prisma.$disconnect();
}

main(); 