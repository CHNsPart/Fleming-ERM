import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { initDatabase } from '../_init';

export async function GET() {
  try {
    await initDatabase();
    const inventory = await prisma.equipment.findMany();
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}