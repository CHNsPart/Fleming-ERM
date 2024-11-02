import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as { prisma?: PrismaClient }

const SQLITE_PATH = process.env.NODE_ENV === 'production' 
  ? '/tmp/prod.db'
  : path.join(process.cwd(), 'prisma/dev.db')

if (process.env.NODE_ENV === 'production') {
  // Ensure the /tmp directory exists
  if (!fs.existsSync('/tmp')) {
    fs.mkdirSync('/tmp')
  }

  // Copy the database file if it doesn't exist in /tmp
  const sourceDbPath = path.join(process.cwd(), 'prisma/prod.db')
  if (fs.existsSync(sourceDbPath) && !fs.existsSync(SQLITE_PATH)) {
    try {
      fs.copyFileSync(sourceDbPath, SQLITE_PATH)
      fs.chmodSync(SQLITE_PATH, 0o666)
    } catch (error) {
      console.error('Error copying database:', error)
    }
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: `file:${SQLITE_PATH}`
      }
    },
    log: ['query', 'error', 'warn'],
  })
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma