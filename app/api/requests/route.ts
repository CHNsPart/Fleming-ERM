import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUser();
  
  if (user?.email !== 'projectapplied02@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
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
    const body = await request.json();
    console.log('Received request body:', body);

    // Validate required fields
    const requiredFields = ['equipmentType', 'quantity', 'purpose', 'pickupDate', 'returnDate', 'campus'];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Find the equipment type (case-insensitive)
    const equipment = await prisma.equipment.findFirst({
      where: {
        name: body.equipmentType.toUpperCase()
      }
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Invalid equipment type' }, { status: 400 });
    }

    // Create the new request
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