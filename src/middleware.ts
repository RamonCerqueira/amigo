import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Configurar CORS para APIs
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Headers CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Headers de segurança
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Rate limiting básico (em produção, usar Redis ou similar)
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Log da requisição para monitoramento
    console.log(`API Request: ${request.method} ${request.nextUrl.pathname} - IP: ${ip}`);
    
    return response;
  }

  // Redirecionamentos e proteções de rotas
  const { pathname } = request.nextUrl;
  
  // Redirecionar rotas antigas ou incorretas
  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/registro', request.url));
  }
  
  if (pathname === '/verify') {
    return NextResponse.redirect(new URL('/verificacao-email', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/register',
    '/verify',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
