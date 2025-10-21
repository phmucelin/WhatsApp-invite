import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    try {
      const decoded = JSON.parse(Buffer.from(token.value, 'base64').toString());
      
      // Verificar se o token não expirou
      if (decoded.exp < Date.now()) {
        return NextResponse.json({
          authenticated: false,
          user: null
        });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        }
      });
    } catch (error) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }
}

