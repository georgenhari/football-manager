// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { createTeam } from '@/lib/team';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }
        
        try {
          // Check if user exists
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { team: true }
          });

          // If user doesn't exist, create new user
          if (!user) {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                password: hashedPassword,
              },
              include: { team: true }
            });

            // Return the user object
            return {
              id: user.id,
              email: user.email,
              hasTeam: false
            };
          }

          // Verify password for existing user
          const passwordValid = await bcrypt.compare(credentials.password, user.password);
          if (!passwordValid) {
            throw new Error('Invalid password');
          }

          // Return the user object
          return {
            id: user.id,
            email: user.email,
            hasTeam: !!user.team
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (user && !user.hasTeam) {
        try {
          await createTeam(user.id);
        } catch (error) {
          console.error('Team creation error:', error);
          // Still allow sign in even if team creation fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        
        const userWithTeam = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { team: true }
        });
        
        session.user.team = userWithTeam?.team || null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth', // Add this to handle errors
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development', // Add this for debugging
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };