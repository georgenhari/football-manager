// src/app/dashboard/page.tsx
import TransferMarket from '@/components/TransferMarket';
import TeamManagement from '@/components/TeamManagement';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Team</h2>
        <TeamManagement />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Transfer Market</h2>
        <TransferMarket />
      </div>
    </div>
  );
}