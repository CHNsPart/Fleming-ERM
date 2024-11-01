import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let isInitialized = false;

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !isInitialized) {
    try {
      await fetch(`${request.nextUrl.origin}/api/init-db`);
      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 });
    }
  }
  return NextResponse.next();
}