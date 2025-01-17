// src/app/api/team/create/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session.user?.email) {
            throw new Error('User email is missing from the session.');
        }

        const { players } = await request.json();

        // Start transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Delete existing team
            await prisma.team.deleteMany({
                where: {
                    user: {
                        email: session.user.email!
                    }
                }
            });

            // Create new team
            const team = await prisma.team.create({
                data: {
                    name: `Team ${Math.random().toString(36).substring(7)}`,
                    budget: 5000000,
                    user: {
                        connect: {
                            email: session.user.email! // Now we know this exists
                        }
                    },
                    players: {
                        connect: players.map((id: string) => ({ id }))
                    }
                }
            });

            return team;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Team creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create team' },
            { status: 500 }
        );
    }
}