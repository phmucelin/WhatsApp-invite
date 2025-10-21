import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log("Iniciando migração do banco...");
    
    // Testar conexão
    await prisma.$connect();
    console.log("Conexão com banco estabelecida");
    
    // Criar tabelas se não existirem
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Event" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "location" TEXT NOT NULL,
        "imageUrl" TEXT,
        "message" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Guest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "sendStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "rsvpStatus" TEXT NOT NULL DEFAULT 'WAITING',
        "resendCount" INTEGER NOT NULL DEFAULT 0,
        "lastSentAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        UNIQUE("phoneNumber", "eventId")
      );
    `;
    
    console.log("Tabelas criadas com sucesso");
    
    return NextResponse.json({
      status: "success",
      message: "Banco migrado com sucesso",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Erro na migração:", error);
    
    return NextResponse.json({
      status: "error",
      message: "Erro na migração",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

