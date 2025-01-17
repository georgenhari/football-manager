# Football Manager Application

A Next.js application that allows users to manage football teams and participate in a transfer market system.

## Core Features
- User authentication (login/register)
- Team management (create team with 15-25 players)
- Transfer market (buy/sell players)
- Position-based player management
- Budget management

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Mandatory Setup Steps

1. **Clone the repository**
```bash
git clone [repository-url]
cd football-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/football_manager"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

5. **Start the development server**
```bash
npm run dev
```

## Optional Steps

1. **Seed the Database**
To populate your database with sample data:
```bash
npx prisma db seed
```

This will create:
- 200 unassigned players
- 20 sample users with teams
- Active transfer market with listed players

2. **Production Deployment**
Additional environment variables for production:
```env
POSTGRES_PRISMA_URL="your-postgres-url"
POSTGRES_URL_NON_POOLING="your-postgres-url"
```

## Project Structure

```
football-manager/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Dashboard views
│   │   ├── team/             # Team management
│   │   └── transfers/        # Transfer market
│   ├── components/           # React components
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
```

## Key Files

### Database
- `prisma/schema.prisma`: Database schema defining User, Team, and Player models
- `prisma/seed.ts`: Script to populate database with sample data

### Authentication
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth configuration
- `src/app/auth/page.tsx`: Login/Register page

### Core Features
- `src/components/CreateTeam.tsx`: Team creation interface
- `src/components/TransferMarket.tsx`: Transfer market interface
- `src/app/api/transfers/route.ts`: Transfer market API endpoints

## Database Seeding

The seed script (`prisma/seed.ts`) creates:

1. **Players**:
   - 200 unassigned players
   - Varied positions (GK, DEF, MID, ATT)
   - Realistic pricing based on position
   - Random names from diverse backgrounds

2. **Users & Teams**:
   - 20 sample users
   - Teams with 15-25 players each
   - Initial budget of 5,000,000
   - ~30% of players listed on transfer market

To modify seed data, edit `prisma/seed.ts`.

## API Routes

1. **Authentication**
- POST `/api/auth/login`
- POST `/api/auth/register`

2. **Team Management**
- GET `/api/team`
- POST `/api/team/create`

3. **Transfer Market**
- GET `/api/transfers`
- POST `/api/transfers/buy`
- POST `/api/transfers/list`

## Contribution

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.