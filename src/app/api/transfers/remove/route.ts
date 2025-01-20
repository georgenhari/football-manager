import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { playerId } = await request.json();

        // Get the player and verify ownership
        const player = await prisma.player.findUnique({
            where: { id: playerId },
            include: {
                team: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        if (player.team?.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Not authorized to remove this player' }, { status: 403 });
        }

        // Remove from transfer list
        const updatedPlayer = await prisma.player.update({
            where: { id: playerId },
            data: {
                isListed: false,
                askingPrice: null
            }
        });

        return NextResponse.json({ success: true, player: updatedPlayer });
    } catch (error) {
        console.error('Remove from transfer error:', error);
        return NextResponse.json(
            { error: 'Failed to remove player from transfer list' },
            { status: 500 }
        );
    }
}