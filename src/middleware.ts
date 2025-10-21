import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('user-session')?.value;

  // Permitir acesso às rotas de API e assets
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/favicon') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redirecionar rotas protegidas para welcome se não tiver sessão
  if (!sessionId) {
    if (request.nextUrl.pathname.startsWith("/dashboard") || 
        request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/welcome", request.url));
    }
  }

  // Redirecionar welcome para dashboard se já tiver sessão
  if (sessionId && request.nextUrl.pathname === "/welcome") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/welcome", "/admin/:path*"],
};
