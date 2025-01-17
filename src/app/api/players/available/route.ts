// src/app/api/players/available/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const players = await prisma.player.findMany({
            where: {
                teamId: null, // Correct way to check for players without a team
            },
            orderBy: {
                position: 'asc', // Ensures players are sorted by position
            },
        });

        return NextResponse.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json(
            { error: 'Failed to fetch players' },
            { status: 500 }
        );
    }
}