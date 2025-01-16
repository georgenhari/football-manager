// scripts/setup-database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('Successfully connected to the database');

    // Run migrations
    console.log('Running migrations...');
    // You'll need to run migrations separately using prisma migrate

    // Seed initial data if needed
    console.log('Seeding initial data...');
    // Add your seeding logic here

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();