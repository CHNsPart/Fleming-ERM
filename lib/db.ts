import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Define the path for the database based on environment
const DB_PATH = process.env.NODE_ENV === 'production' 
  ? '/tmp/prod.db'
  : path.join(process.cwd(), 'prisma/dev.db');

declare global {
  var prisma: PrismaClient | undefined;
}

async function initializeDatabase() {
  try {
    // Create /tmp directory in production if it doesn't exist
    if (process.env.NODE_ENV === 'production' && !fs.existsSync('/tmp')) {
      fs.mkdirSync('/tmp', { recursive: true });
    }

    const sourceDbPath = path.join(process.cwd(), 'prisma/prod.db');
    
    // In production, copy the database to /tmp if it doesn't exist
    if (process.env.NODE_ENV === 'production' && !fs.existsSync(DB_PATH)) {
      if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, DB_PATH);
        // Set permissive permissions
        fs.chmodSync(DB_PATH, 0o666);
      } else {
        // Create an empty database if the source doesn't exist
        fs.writeFileSync(DB_PATH, '');
        fs.chmodSync(DB_PATH, 0o666);
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize database');
  }
}

async function createPrismaClient() {
  await initializeDatabase();
  
  return new PrismaClient({
    datasources: {
      db: {
        url: `file:${DB_PATH}`
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });
}

// Singleton pattern for PrismaClient
async function getPrismaClient() {
  if (process.env.NODE_ENV === 'production') {
    // In production, create a new client for each request
    return await createPrismaClient();
  }

  // In development, reuse the client
  if (!global.prisma) {
    global.prisma = await createPrismaClient();
  }
  return global.prisma;
}

// Helper to safely execute database operations
async function withPrisma<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  const prisma = await getPrismaClient();
  try {
    return await operation(prisma);
  } finally {
    // Clean up in production
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}

export { withPrisma, getPrismaClient as default };