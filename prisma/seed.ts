import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting seed...')

    // Check if we already have equipment
    const existingEquipment = await prisma.equipment.count()
    
    if (existingEquipment === 0) {
      console.log('No existing equipment found. Creating initial equipment...')
      
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
      ]

      for (const equipment of equipmentData) {
        await prisma.equipment.create({ data: equipment })
        console.log(`Created equipment: ${equipment.name}`)
      }

      console.log('Seed completed successfully!')
    } else {
      console.log('Equipment already exists. Skipping seed.')
    }
  } catch (error) {
    console.error('Error during seed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })