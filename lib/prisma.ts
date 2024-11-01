import { PrismaClient } from '@prisma/client'
import fs from 'fs'

declare global {
  var prisma: PrismaClient | undefined
}

const initializeDatabase = () => {
  const tmpPath = '/tmp/dev.db'
  const dbPath = process.cwd() + '/prisma/dev.db'
  
  if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(dbPath, tmpPath)
    } catch (error) {
      console.error('Error copying database:', error)
    }
  }
}

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === 'production') {
    initializeDatabase()
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.NODE_ENV === 'production' 
          ? 'file:/tmp/dev.db'
          : 'file:./prisma/dev.db'
      }
    }
  })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma