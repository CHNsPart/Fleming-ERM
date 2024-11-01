import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import fs from 'fs';
import path from 'path';
import { initDatabase } from '../_init';

async function ensureDatabaseExists() {
  if (process.env.NODE_ENV === 'production') {
    const dbPath = '/tmp/app.db';
    const sourceDbPath = path.join(process.cwd(), 'prisma/app.db');

    // Check if database exists in tmp
    if (!fs.existsSync(dbPath) && fs.existsSync(sourceDbPath)) {
      try {
        // Copy database file to tmp directory
        fs.copyFileSync(sourceDbPath, dbPath);
        // Set proper permissions
        fs.chmodSync(dbPath, 0o666);
      } catch (error) {
        console.error('Error setting up database:', error);
        throw new Error('Database setup failed');
      }
    }
  }
}

async function isApprover() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  return user?.email === 'projectapplied02@gmail.com';
}

export async function GET() {
  try {
    await ensureDatabaseExists();
    const equipmentTypes = await prisma.equipment.findMany({
      select: { 
        id: true, 
        name: true, 
        totalQuantity: true, 
        availableQuantity: true, 
        imageUrl: true 
      },
    });
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
    await initDatabase(); 
    
    const body = await request.json();
    console.log('Received body:', body); // Add logging
    
    const newEquipment = await prisma.equipment.create({
      data: {
        name: body.name.toUpperCase(),
        totalQuantity: parseInt(body.totalQuantity),
        availableQuantity: parseInt(body.availableQuantity),
        imageUrl: body.imageUrl || null,
      },
    });
    
    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    console.error('Detailed error:', error); // Add detailed error logging
    return NextResponse.json({ 
      error: 'Failed to create equipment type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!await isApprover()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await ensureDatabaseExists();
    const body = await request.json();
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
  } catch (error) {
    console.error('Error updating equipment type:', error);
    return NextResponse.json({ 
      error: 'Failed to update equipment type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await isApprover()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await ensureDatabaseExists();
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