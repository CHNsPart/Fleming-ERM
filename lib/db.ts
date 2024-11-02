// lib/db.ts

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as { prisma?: PrismaClient }

// Use different paths for production and development
const DB_PATH = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'prisma/prod.db')
  : path.join(process.cwd(), 'prisma/dev.db');

// Ensure database exists and is accessible
const ensureDatabase = () => {
  try {
    const dbDir = path.dirname(DB_PATH);
    
    // Ensure the directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // If database doesn't exist, create it
    if (!fs.existsSync(DB_PATH)) {
      // In production, copy from the template if it exists
      const templatePath = path.join(process.cwd(), 'prisma/template.db');
      if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, DB_PATH);
      } else {
        // Create empty file if template doesn't exist
        fs.writeFileSync(DB_PATH, '');
      }
      fs.chmodSync(DB_PATH, 0o666);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error(`Failed to initialize database at ${DB_PATH}`);
  }
}

const prismaClientSingleton = () => {
  ensureDatabase();
  return new PrismaClient({
    datasources: {
      db: {
        url: `file:${DB_PATH}`
      }
    },
    log: ['error', 'warn']
  });
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;