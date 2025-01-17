import { prisma } from './db';

// Define player position types
type Position = 'GK' | 'DEF' | 'MID' | 'ATT';

// Initial team structure
const INITIAL_SQUAD = {
  GK: 3,
  DEF: 6,
  MID: 6,
  ATT: 5,
} as const;

// Sample player names for each position
const PLAYER_NAMES: Record<Position, string[]> = {
  GK: [
    "David De Gea", "Manuel Neuer", "Alisson Becker", "Ederson", 
    "Jan Oblak", "Thibaut Courtois", "Keylor Navas", "Marc-André ter Stegen"
  ],
  DEF: [
    "Virgil van Dijk", "Sergio Ramos", "Thiago Silva", "Giorgio Chiellini",
    "Joshua Kimmich", "Andrew Robertson", "Trent Alexander-Arnold", "Rúben Dias",
    "Marquinhos", "Kalidou Koulibaly", "Matthijs de Ligt", "João Cancelo"
  ],
  MID: [
    "Kevin De Bruyne", "N'Golo Kanté", "Joshua Kimmich", "Luka Modric",
    "Toni Kroos", "Bruno Fernandes", "Casemiro", "Marco Verratti",
    "Frenkie de Jong", "Rodri", "Fabinho", "Jorginho"
  ],
  ATT: [
    "Erling Haaland", "Kylian Mbappé", "Robert Lewandowski", "Harry Kane",
    "Mohamed Salah", "Karim Benzema", "Neymar Jr", "Son Heung-min",
    "Sadio Mané", "Romelu Lukaku"
  ]
};

// Generate a random price within a range based on position
const generatePlayerPrice = (position: Position): number => {
  const priceRanges: Record<Position, [number, number]> = {
    GK: [500000, 2000000],
    DEF: [1000000, 3000000],
    MID: [1500000, 4000000],
    ATT: [2000000, 5000000]
  };

  const [min, max] = priceRanges[position];
  return Math.floor(Math.random() * (max - min) + min);
};

// Get a random name from the position-specific list
const getRandomName = (position: Position): string => {
  const names = PLAYER_NAMES[position];
  return names[Math.floor(Math.random() * names.length)];
};

// Create initial squad of players
const createInitialPlayers = (teamId: string) => {
  const players = [];

  for (const [position, count] of Object.entries(INITIAL_SQUAD)) {
    for (let i = 0; i < count; i++) {
      players.push({
        name: getRandomName(position as Position),
        position,
        price: generatePlayerPrice(position as Position),
        teamId,
        isListed: false
      });
    }
  }

  return players;
};


// Create a new team for a user
export const createTeam = async (userId: string) => {
  try {
    // Start a transaction
    return await prisma.$transaction(async (prisma) => {
      // Create the team
      const team = await prisma.team.create({
        data: {
          name: `Team ${Math.random().toString(36).substring(7)}`,
          budget: 5000000,
          userId
        }
      });

      // Generate and create initial players
      const players = createInitialPlayers(team.id);
      await prisma.player.createMany({
        data: players
      });

      // Return the team with players
      return await prisma.team.findUnique({
        where: { id: team.id },
        include: {
          players: true
        }
      });
    });
  } catch (error) {
    console.error('Error creating team:', error);
    throw new Error('Failed to create team');
  }
};

// Get team by user ID
export const getTeamByUserId = async (userId: string) => {
  return await prisma.team.findFirst({
    where: { userId },
    include: {
      players: true
    }
  });
};

// List a player for transfer
export const listPlayerForTransfer = async (playerId: string, askingPrice: number) => {
  return await prisma.player.update({
    where: { id: playerId },
    data: {
      isListed: true,
      askingPrice
    }
  });
};

// Remove player from transfer list
export const removePlayerFromTransfer = async (playerId: string) => {
  return await prisma.player.update({
    where: { id: playerId },
    data: {
      isListed: false,
      askingPrice: null
    }
  });
};

// Check if team meets size requirements
export const validateTeamSize = async (teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      _count: {
        select: { players: true }
      }
    }
  });

  if (!team) throw new Error('Team not found');

  const playerCount = team._count.players;
  return {
    isValid: playerCount >= 15 && playerCount <= 25,
    currentCount: playerCount
  };
};