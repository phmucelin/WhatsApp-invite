import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      status: "success",
      config: {
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        // Não expor o secret por segurança
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Config test error:", error);
    
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

