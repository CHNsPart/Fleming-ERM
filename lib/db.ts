import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as { prisma?: PrismaClient }

// Always use /tmp/dev.db for consistency between development and production
const DB_PATH = '/tmp/dev.db'

// Ensure database exists and is accessible
const ensureDatabase = () => {
  try {
    // Create /tmp if it doesn't exist
    if (!fs.existsSync('/tmp')) {
      fs.mkdirSync('/tmp')
    }

    // Copy database from prisma directory if it doesn't exist in /tmp
    const sourceDbPath = path.join(process.cwd(), 'prisma/dev.db')
    if (fs.existsSync(sourceDbPath) && !fs.existsSync(DB_PATH)) {
      fs.copyFileSync(sourceDbPath, DB_PATH)
      fs.chmodSync(DB_PATH, 0o666)
    }

    // If neither exists, create an empty file
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, '')
      fs.chmodSync(DB_PATH, 0o666)
    }
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

ensureDatabase()

const prismaClientSingleton = () => {
  try {
    return new PrismaClient({
      datasources: {
        db: {
          url: `file:${DB_PATH}`
        }
      },
      log: ['error', 'warn', 'query'],
    })
  } catch (error) {
    console.error('Error creating Prisma Client:', error)
    throw error
  }
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma