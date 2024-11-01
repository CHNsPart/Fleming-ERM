// app/api/inventory/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const inventory = await prisma.equipment.findMany();
  return NextResponse.json(inventory);
}