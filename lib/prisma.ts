import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prismaClientSingleton = () => {
  // If in production, try to set up the database
  if (process.env.NODE_ENV === 'production') {
    try {
      // Ensure the migrations are applied
      execSync('prisma migrate deploy')
    } catch (error) {
      console.error('Migration error:', error)
    }
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: "file:/tmp/app.db"
      }
    },
    log: ['query', 'error', 'warn']
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma