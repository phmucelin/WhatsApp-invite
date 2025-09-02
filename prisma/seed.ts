import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')

  try {
    // Limpa o banco de dados
    await prisma.guest.deleteMany()
    await prisma.event.deleteMany()
    await prisma.user.deleteMany()
    console.log('Banco de dados limpo')

    // Cria as tabelas
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );`

    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`

    console.log('Tabelas criadas com sucesso')
  } catch (error) {
    console.error('Erro durante o seed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 