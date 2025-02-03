import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { initDatabase } from '../_init';

export async function GET(request: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUser();
  
  // Check if the user is an admin (you may want to implement a more robust role check)
  if (user?.email !== 'projectapplied02@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const requests = await prisma.request.findMany({
      where: status ? { status: status.toUpperCase() } : {},
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch requests', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const kindeUser = await getUser();
  
  if (!kindeUser || !kindeUser.id) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    await initDatabase();
    const body = await request.json();
    console.log('Received request body:', body);

    // Ensure all required fields are present
    const requiredFields = ['equipmentType', 'quantity', 'purpose', 'pickupDate', 'returnDate', 'campus'];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Simple direct name comparison
    const equipment = await prisma.equipment.findFirst({
      where: {
        name: body.equipmentType
      }
    });

    console.log('Looking for equipment:', body.equipmentType);
    console.log('Found equipment:', equipment);

    if (!equipment) {
      const allEquipment = await prisma.equipment.findMany();
      console.log('Available equipment:', allEquipment);
      
      return NextResponse.json({ 
        error: 'Invalid equipment type', 
        requested: body.equipmentType,
        available: allEquipment.map(e => e.name),
      }, { status: 400 });
    }

    // Rest of your code for creating the request...
    const newRequest = await prisma.request.create({
      data: {
        user: {
          connectOrCreate: {
            where: { id: kindeUser.id },
            create: {
              id: kindeUser.id,
              name: kindeUser.given_name || kindeUser.family_name || 'Unknown',
              email: kindeUser.email || '',
            },
          },
        },
        equipment: {
          connect: { id: equipment.id },
        },
        equipmentType: equipment.name,
        quantity: parseInt(body.quantity),
        returnedQuantity: 0,
        purpose: body.purpose,
        pickupDate: new Date(body.pickupDate),
        returnDate: new Date(body.returnDate),
        status: 'PENDING',
        campus: body.campus,
      },
    });

    console.log('Created new request:', newRequest);
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ 
      error: 'Failed to create request', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}