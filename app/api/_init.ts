import fs from 'fs';
import path from 'path';

export async function initDatabase() {
  if (process.env.NODE_ENV === 'production') {
    const targetDbPath = '/tmp/prod.db';
    const sourceDbPath = path.join(process.cwd(), 'prisma/prod.db');

    if (!fs.existsSync('/tmp')) {
      fs.mkdirSync('/tmp');
    }

    if (fs.existsSync(sourceDbPath) && !fs.existsSync(targetDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, targetDbPath);
        fs.chmodSync(targetDbPath, 0o666);
      } catch (error) {
        console.error('Error initializing database:', error);
        throw new Error('Failed to initialize database');
      }
    }
  }
}

export function getDbPath() {
  return process.env.NODE_ENV === 'production' 
    ? '/tmp/prod.db'
    : path.join(process.cwd(), 'prisma/dev.db');
}