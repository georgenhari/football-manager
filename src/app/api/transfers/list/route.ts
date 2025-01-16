// src/app/api/transfers/list/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { playerId, askingPrice } = await request.json();

  const player = await prisma.player.update({
    where: {
      id: playerId,
    },
    data: {
      isListed: true,
      askingPrice,
    },
  });

  return NextResponse.json(player);
}