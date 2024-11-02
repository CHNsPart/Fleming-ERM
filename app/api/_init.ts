import fs from 'fs';
import path from 'path';

const DB_PATH = '/tmp/dev.db';

export async function initDatabase() {
  try {
    // Create /tmp if it doesn't exist
    if (!fs.existsSync('/tmp')) {
      fs.mkdirSync('/tmp');
    }

    // Copy database if it doesn't exist in /tmp
    const sourceDbPath = path.join(process.cwd(), 'prisma/dev.db');
    if (fs.existsSync(sourceDbPath) && !fs.existsSync(DB_PATH)) {
      fs.copyFileSync(sourceDbPath, DB_PATH);
      fs.chmodSync(DB_PATH, 0o666);
    }

    // If neither exists, create an empty file
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, '');
      fs.chmodSync(DB_PATH, 0o666);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize database');
  }
}

export function getDbPath() {
  return DB_PATH;
}