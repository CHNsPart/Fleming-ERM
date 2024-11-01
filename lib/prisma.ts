import { PrismaClient } from '@prisma/client'

// Explicitly extend the NodeJS.Global interface
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prismaOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaOptions)
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient(prismaOptions)
  }
  prisma = globalThis.prisma
}

export default prisma