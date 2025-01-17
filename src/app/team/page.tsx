import CreateTeam from '@/components/CreateTeam';

export default function TeamPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Your Team</h1>
        <p className="text-gray-600 mt-2">
          Select between 15-25 players to form your team. Make sure to meet the minimum requirements for each position.
        </p>
      </div>
      <CreateTeam />
    </div>
  );
}