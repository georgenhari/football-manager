// src/app/api/transfers/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerName = searchParams.get('playerName');
  const teamName = searchParams.get('teamName');
  const maxPrice = searchParams.get('maxPrice');

  const whereClause: any = {
    isListed: true,
  };

  if (playerName) {
    whereClause.name = {
      contains: playerName,
      mode: 'insensitive',
    };
  }

  if (teamName) {
    whereClause.team = {
      name: {
        contains: teamName,
        mode: 'insensitive',
      },
    };
  }

  if (maxPrice) {
    whereClause.askingPrice = {
      lte: parseFloat(maxPrice),
    };
  }

  const listedPlayers = await prisma.player.findMany({
    where: whereClause,
    include: {
      team: true,
    },
  });

  return NextResponse.json(listedPlayers);
}