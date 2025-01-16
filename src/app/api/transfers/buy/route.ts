import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { playerId } = await request.json();

    // Start transaction
    const result = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
        // Get player and buying team
        const player = await tx.player.findUnique({
            where: { id: playerId },
            include: { team: true },
        });

        const buyingTeam = await tx.team.findFirst({
            where: { user: { email: session.user?.email } },
            include: { players: true },
        });

        if (!player || !buyingTeam) {
            throw new Error('Player or team not found');
        }

        // Check if player is listed
        if (!player.isListed) {
            throw new Error('Player is not listed for transfer');
        }

        // Calculate purchase price (95% of asking price)
        const purchasePrice = player.askingPrice! * 0.95;

        // Check if team has enough budget
        if (buyingTeam.budget < purchasePrice) {
            throw new Error('Insufficient funds');
        }

        // Check team size constraints
        if (buyingTeam.players.length >= 25) {
            throw new Error('Team already has maximum number of players');
        }

        if (player.team.players.length <= 15) {
            throw new Error('Selling team cannot have fewer than 15 players');
        }

        // Transfer player
        await tx.player.update({
            where: { id: playerId },
            data: {
                teamId: buyingTeam.id,
                isListed: false,
                askingPrice: null,
            },
        });

        // Update team budgets
        await tx.team.update({
            where: { id: buyingTeam.id },
            data: { budget: buyingTeam.budget - purchasePrice },
        });

        await tx.team.update({
            where: { id: player.team.id },
            data: { budget: player.team.budget + purchasePrice },
        });

        return { success: true };
    });

    return NextResponse.json(result);
}