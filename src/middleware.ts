import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Verificar se é uma rota protegida
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Verificar token de autenticação
    const authToken = request.cookies.get('auth-token');
    
    if (!authToken) {
      // Redirecionar para login se não autenticado
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verificar se o token é válido
      const tokenData = JSON.parse(Buffer.from(authToken.value, 'base64').toString());
      
      // Verificar se o token não expirou
      if (tokenData.exp && Date.now() > tokenData.exp) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      // Token inválido, redirecionar para login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
