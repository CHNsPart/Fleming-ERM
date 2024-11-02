import { NextResponse } from 'next/server';
import { withPrisma } from '@/lib/db';

export async function GET() {
  try {
    let inventory = await withPrisma(async (prisma) => {
      const data = await prisma.equipment.findMany();
      console.log('Inventory query result:', data);
      return data;
    });

    // If no data is found, seed the database
    if (inventory.length === 0 && process.env.NODE_ENV === 'production') {
      console.log('No inventory found, initializing seed data...');
      
      inventory = await withPrisma(async (prisma) => {
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

        // Use transaction to create records one by one
        await prisma.$transaction(
          equipmentData.map((data) =>
            prisma.equipment.upsert({
              where: { name: data.name },
              update: data,
              create: data,
            })
          )
        );
        
        return await prisma.equipment.findMany();
      });
    }

    // Always return a NextResponse
    return NextResponse.json(inventory, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';