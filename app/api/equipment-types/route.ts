import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// Helper function to check if user is an approver
async function isApprover() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  return user?.email === 'projectapplied02@gmail.com';
}

export async function GET() {
  try {
    const equipmentTypes = await prisma.equipment.findMany({
      select: { id: true, name: true, totalQuantity: true, availableQuantity: true, imageUrl: true },
    });
    console.log("Fetched equipment types:", equipmentTypes);
    return NextResponse.json(equipmentTypes);
  } catch (error) {
    console.error('Error fetching equipment types:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment types' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isApprover()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    console.log("Received POST data:", body); 
    const newEquipment = await prisma.equipment.create({
      data: {
        name: body.name.toUpperCase(),
        totalQuantity: body.totalQuantity,
        availableQuantity: body.availableQuantity,
        imageUrl: body.imageUrl,
      },
    });
    console.log("Created equipment:", newEquipment); 
    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment type:', error);
    return NextResponse.json({ error: 'Failed to create equipment type' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!await isApprover()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updatedEquipment = await prisma.equipment.update({
      where: { id: body.id },
      data: {
        name: body.name,
        totalQuantity: body.totalQuantity,
        availableQuantity: body.availableQuantity,
        imageUrl: body.imageUrl, // Add this line
      },
    });
    return NextResponse.json(updatedEquipment);
  } catch (error) {
    console.error('Error updating equipment type:', error);
    return NextResponse.json({ error: 'Failed to update equipment type' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await isApprover()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.request.deleteMany({
        where: { equipmentId: id },
      });

      await prisma.equipment.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: 'Equipment type and associated requests deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment type:', error);
    return NextResponse.json({ 
      error: 'Failed to delete equipment type', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}