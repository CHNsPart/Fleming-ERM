import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Define the path for the database based on environment
const DB_PATH = process.env.NODE_ENV === 'production' 
  ? '/tmp/prod.db'
  : path.join(process.cwd(), 'prisma/dev.db');

// Create a type-safe global store
const globalForPrisma = global as { prisma?: PrismaClient }

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
        
        // Log successful database copy
        console.log('Database copied successfully to:', DB_PATH);
      } else {
        // Create an empty database if the source doesn't exist
        fs.writeFileSync(DB_PATH, '');
        fs.chmodSync(DB_PATH, 0o666);
        
        // Initialize with seed data
        await seedDatabase();
        console.log('Empty database created and seeded at:', DB_PATH);
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize database');
  }
}

async function seedDatabase() {
  const prisma = await createPrismaClient();
  
  try {
    // Delete existing data
    await prisma.request.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.user.deleteMany();

    // Add initial equipment
    const equipmentData = [
      {
        name: 'LONG SLEEVE T-SHIRT',
        totalQuantity: 50,
        availableQuantity: 50,
        imageUrl: 'https://bkstr.scene7.com/is/image/Bkstr/939-R64LT-WA17253-Black?$HomePageRecs_ET$'
      },
      {
        name: 'POLO SHIRT',
        totalQuantity: 30,
        availableQuantity: 30,
        imageUrl: 'https://bkstr.scene7.com/is/image/Bkstr/939-MQK00075-WSP1-Black?$HomePageRecs_ET$&fmt=png-alpha'
      },
      {
        name: 'GRAD HOODIE',
        totalQuantity: 25,
        availableQuantity: 25,
        imageUrl: 'https://bkstr.scene7.com/is/image/Bkstr/939-4186KH-GRAD-Black?$GMCategory_ET$'
      },
      {
        name: 'BEAN HAT',
        totalQuantity: 40,
        availableQuantity: 40,
        imageUrl: 'https://bkstr.scene7.com/is/image/Bkstr/939-T-CS4003-WDMK-D-Black?$GMCategory_ET$'
      }
    ];

    for (const equipment of equipmentData) {
      await prisma.equipment.create({ data: equipment });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
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
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = await createPrismaClient();
  }
  return globalForPrisma.prisma;
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