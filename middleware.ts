import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import fs from 'fs'

async function initializeDatabase() {
  const tmpPath = '/tmp/dev.db'
  const dbPath = process.cwd() + '/prisma/dev.db'
  
  if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(dbPath, tmpPath)
      console.log('Database initialized in /tmp')
    } catch (error) {
      console.error('Error initializing database:', error)
      throw error
    }
  }
}

export async function middleware(request: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();

  // Initialize database for API routes in production
  if (process.env.NODE_ENV === 'production' && request.nextUrl.pathname.startsWith('/api')) {
    try {
      await initializeDatabase()
    } catch (error) {
      console.error('Database initialization failed:', error)
      return NextResponse.json(
        { error: 'Internal server error: Database initialization failed' }, 
        { status: 500 }
      )
    }
  }

  // Check if the user is authenticated
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  // Allow GET requests to /api/equipment-types for all authenticated users
  if (request.method === 'GET' && request.nextUrl.pathname === '/api/equipment-types') {
    return NextResponse.next();
  }

  // Check for approver role (email-based) for other routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      (request.nextUrl.pathname.startsWith('/api/equipment-types') && request.method !== 'GET')) {
    if (user?.email !== 'projectapplied02@gmail.com') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/equipment-types/:path*', '/request-form', '/equipment-return'],
}