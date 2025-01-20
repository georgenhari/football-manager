import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { playerId } = await request.json();
      
      const result = await prisma.$transaction(async (prisma) => {
        // Get player and buying team
        const player = await prisma.player.findUnique({
          where: { id: playerId },
          include: {
            team: {
              include: {
                players: true,
              },
            },
          },
        });
  
        if (!session.user?.email) {
          return { error: 'User email is missing in session.' };
        }
  
        const buyingTeam = await prisma.team.findFirst({
          where: { user: { email: session.user.email } },
          include: { players: true },
        });
  
        if (!player) {
          return { error: 'Player not found' };
        }
  
        if (!player.team) {
          return { error: 'Player is not associated with any team' };
        }
  
        if (!buyingTeam) {
          return { error: 'Buying team not found' };
        }
  
        // Check if player is listed
        if (!player.isListed) {
          return { error: 'Player is not listed for transfer' };
        }
  
        // Check if asking price exists
        if (!player.askingPrice) {
          return { error: 'Player asking price is not set' };
        }
  
        // Calculate purchase price (95% of asking price)
        const purchasePrice = player.askingPrice * 0.95;
  
        // Check if team has enough budget
        if (buyingTeam.budget < purchasePrice) {
          return { error: 'Insufficient funds' };
        }
  
        // Check team size constraints
        if (buyingTeam.players.length >= 25) {
          return { error: 'Team already has maximum number of players' };
        }
  
        if (player.team.players.length <= 15) {
          return { error: 'Selling team cannot have fewer than 15 players' };
        }
  
        // Transfer player
        await prisma.player.update({
          where: { id: playerId },
          data: {
            teamId: buyingTeam.id,
            isListed: false,
            askingPrice: null,
          },
        });
  
        // Update team budgets
        await prisma.team.update({
          where: { id: buyingTeam.id },
          data: { budget: buyingTeam.budget - purchasePrice },
        });
  
        await prisma.team.update({
          where: { id: player.team.id },
          data: { budget: player.team.budget + purchasePrice },
        });
  
        return { success: true, message: 'Transfer completed successfully' };
      });
  
      if ('error' in result) {
        console.log(result.error)
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
  
      return NextResponse.json(result);
    } catch (error) {
      console.error('Transfer error:', error);
      return NextResponse.json(
        { error: 'An unexpected error occurred during transfer' },
        { status: 500 }
      );
    }
  }