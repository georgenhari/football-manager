// src/app/api/transfers/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerName = searchParams.get('playerName');
  const teamName = searchParams.get('teamName');
  const maxPrice = searchParams.get('maxPrice');

  const whereClause: Prisma.PlayerWhereInput = {
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