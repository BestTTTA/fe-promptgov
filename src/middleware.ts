import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('promtgov-token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/documents', request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    '/pages/:path*',
    '/auth/:path*',
  ],
};
