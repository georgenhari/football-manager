// src/app/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth');
  } else {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen p-8">
      <h1>Football Manager Dashboard</h1>
    </main>
  );
}