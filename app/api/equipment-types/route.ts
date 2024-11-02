import { NextRequest, NextResponse } from 'next/server';
import { withPrisma } from '@/lib/db';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  try {
    return await withPrisma(async (prisma) => {
      const equipmentTypes = await prisma.equipment.findMany({
        select: { 
          id: true, 
          name: true, 
          totalQuantity: true, 
          availableQuantity: true, 
          imageUrl: true 
        },
        orderBy: {
          name: 'asc'
        }
      });

      return NextResponse.json(equipmentTypes);
    });
  } catch (error) {
    console.error('Error fetching equipment types:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return await withPrisma(async (prisma) => {
      const newEquipment = await prisma.equipment.create({
        data: {
          name: body.name.toUpperCase(),
          totalQuantity: parseInt(body.totalQuantity),
          availableQuantity: parseInt(body.availableQuantity),
          imageUrl: body.imageUrl || null,
        },
      });
      
      return NextResponse.json(newEquipment, { status: 201 });
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ 
      error: 'Failed to create equipment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isApprover())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    return await withPrisma(async (prisma) => {
      const updatedEquipment = await prisma.equipment.update({
        where: { id: body.id },
        data: {
          name: body.name,
          totalQuantity: body.totalQuantity,
          availableQuantity: body.availableQuantity,
          imageUrl: body.imageUrl,
        },
      });
      
      return NextResponse.json(updatedEquipment);
    });
  } catch (error) {
    console.error('Error updating equipment type:', error);
    return NextResponse.json({ 
      error: 'Failed to update equipment type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isApprover())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
    }

    return await withPrisma(async (prisma) => {
      await prisma.$transaction([
        prisma.request.deleteMany({
          where: { equipmentId: id },
        }),
        prisma.equipment.delete({
          where: { id },
        }),
      ]);

      return NextResponse.json({ message: 'Equipment type and associated requests deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting equipment type:', error);
    return NextResponse.json({ 
      error: 'Failed to delete equipment type', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function isApprover() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  return user?.email === 'projectapplied02@gmail.com';
}