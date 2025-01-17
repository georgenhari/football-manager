import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Player generation constants
const FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Carlos', 'Juan',
  'Luis', 'Marco', 'Paolo', 'Giuseppe', 'Hans', 'Franz', 'Mohamed', 'Ahmed',
  'Yuki', 'Kai', 'Lee', 'Kim', 'Oliver', 'Harry', 'Jack', 'Lucas'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez',
  'Rodriguez', 'Rossi', 'Ferrari', 'Mueller', 'Schmidt', 'Silva', 'Santos',
  'Kim', 'Lee', 'Wang', 'Chen', 'Taylor', 'Davies', 'Wilson', 'Evans'
];

type Position = 'GK' | 'DEF' | 'MID' | 'ATT';
const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'ATT'];

const POSITION_PRICES: Record<Position, number> = {
  'GK': 500000,
  'DEF': 1000000,
  'MID': 1500000,
  'ATT': 2000000
};

function generateRandomPlayer() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  
  const basePrice = POSITION_PRICES[position];
  const priceVariation = basePrice * 0.5; // 50% variation
  const price = basePrice + (Math.random() * priceVariation);

  return {
    name: `${firstName} ${lastName}`,
    position,
    price: Math.round(price),
    isListed: false,
    askingPrice: null
  };
}

async function main() {
  // Clear existing data
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  // Create 200 unassigned players
  const unassignedPlayers = await Promise.all(
    Array(200).fill(null).map(async () => {
      return await prisma.player.create({
        data: generateRandomPlayer()
      });
    })
  );

  // Create 20 users with teams and some listed players
  for (let i = 0; i < 20; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: `user${i + 1}@example.com`,
        password: hashedPassword
      }
    });

    // Create team for user
    const team = await prisma.team.create({
      data: {
        name: `Team ${i + 1}`,
        budget: 5000000,
        userId: user.id
      }
    });

    // Assign random number of players (15-25) to team
    const numPlayers = Math.floor(Math.random() * 11) + 15; // Random number between 15-25
    const teamPlayers = await Promise.all(
      Array(numPlayers).fill(null).map(async () => {
        const player = generateRandomPlayer();
        // 30% chance of being listed for transfer
        const isListed = Math.random() < 0.3;
        return await prisma.player.create({
          data: {
            ...player,
            teamId: team.id,
            isListed,
            askingPrice: isListed ? Math.round(player.price * 1.2) : null // 20% markup for listed players
          }
        });
      })
    );

    console.log(teamPlayers);
  }

  console.log('Database seeded successfully!', unassignedPlayers);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });