// src/app/dashboard/page.tsx
import TeamManagement from '@/components/TeamManagement';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Team</h2>
      <TeamManagement />
    </div>
  );
}