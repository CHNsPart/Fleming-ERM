import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Starting database seed...')

    // Create production database if it doesn't exist
    const prodDbPath = path.join(__dirname, 'prod.db')
    if (!fs.existsSync(prodDbPath)) {
      console.log('📦 Creating production database...')
      fs.copyFileSync(path.join(__dirname, 'dev.db'), prodDbPath)
      console.log('✅ Production database created')
    }

    // Initial equipment data
    const initialEquipment = [
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

    console.log('🗑️ Cleaning existing data...')
    // Delete all existing records first
    await prisma.request.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleaned')

    console.log('📝 Creating new equipment records...')
    // Create equipment items
    for (const equipment of initialEquipment) {
      const created = await prisma.equipment.create({
        data: equipment
      });
      console.log(`✅ Created equipment: ${created.name} (ID: ${created.id})`);
    }

    console.log('🎉 Seeding finished successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:')
    console.error(e)
    process.exit(1)
  })