import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json({ status: 'development' });
  }

  try {
    const dbPath = path.join(process.cwd(), 'prisma/dev.db');
    const tmpPath = '/tmp/dev.db';

    if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, tmpPath);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 });
  }
}