// src/app/api/team/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.user?.email) {
    throw new Error('User email is missing from the session.');
  }

  const team = await prisma.team.findFirst({
    where: {
      user: {
        email: session.user.email, // Guaranteed to be a string
      },
    },
    include: {
      players: true,
    },
  });

  return NextResponse.json(team);
}