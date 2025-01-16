import { DefaultSession } from 'next-auth';
import { Team } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      team: Team | null;
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    hasTeam: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}