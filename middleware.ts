import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function middleware(request: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();

  // Check if the user is authenticated
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  // Allow GET requests to /api/equipment-types for all authenticated users
  if (request.method === 'GET' && request.nextUrl.pathname === '/api/equipment-types') {
    return NextResponse.next();
  }

  // Check for admin routes and equipment return
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/equipment-return') ||
      (request.nextUrl.pathname.startsWith('/api/equipment-types') && request.method !== 'GET')) {
    if (user?.email !== 'projectapplied02@gmail.com') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/api/equipment-types/:path*',
    '/api/users/active',
    '/request-form', 
    '/equipment-return',
    '/analytics'
  ],
}