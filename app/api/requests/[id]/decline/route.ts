// app/api/requests/[id]/decline/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  const updatedRequest = await prisma.request.update({
    where: { id },
    data: { status: 'DECLINED' },
  });

  return NextResponse.json(updatedRequest);
}