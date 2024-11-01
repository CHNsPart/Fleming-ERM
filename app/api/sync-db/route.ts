import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Copy the database from assets to /tmp
    const dbPath = path.join(process.cwd(), 'prisma/dev.db');
    const tmpPath = '/tmp/dev.db';

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, tmpPath);
      return NextResponse.json({ success: true, message: 'Database synchronized' });
    } else {
      return NextResponse.json({ success: false, message: 'Source database not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error syncing database:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}