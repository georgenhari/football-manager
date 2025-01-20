// src/app/dashboard/page.tsx
import TeamManagement from '@/components/TeamManagement';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Team</h1>
      </div>
      <TeamManagement />
    </div>
  );
}