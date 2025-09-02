import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[HEALTH] Health check iniciado");
    
    // Testar conexão com o banco
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("[HEALTH] Banco conectado:", result);
    
    // Contar convidados
    const guestCount = await prisma.guest.count();
    console.log("[HEALTH] Total de convidados:", guestCount);
    
    // Contar eventos
    const eventCount = await prisma.event.count();
    console.log("[HEALTH] Total de eventos:", eventCount);
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      guests: guestCount,
      events: eventCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[HEALTH] Erro:", error);
    return NextResponse.json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 