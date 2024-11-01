import fs from 'fs';
import path from 'path';

export async function initDatabase() {
  if (process.env.NODE_ENV === 'production') {
    const sourceDbPath = path.join(process.cwd(), 'prisma/dev.db');
    const targetDbPath = '/tmp/dev.db';
    
    if (fs.existsSync(sourceDbPath) && !fs.existsSync(targetDbPath)) {
      fs.copyFileSync(sourceDbPath, targetDbPath);
    }
  }
}