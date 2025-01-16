// src/components/TeamManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { Team, Player } from '@prisma/client';

export default function TeamManagement() {
  const [team, setTeam] = useState<Team & { players: Player[] }>();

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then(setTeam);
  }, []);

  const handleListPlayer = async (playerId: string) => {
    const askingPrice = prompt('Enter asking price:');
    if (!askingPrice) return;

    try {
      await fetch('/api/transfers/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          askingPrice: parseFloat(askingPrice),
        }),
      });
      
      // Refresh team data
      const updatedTeam = await fetch('/api/team').then(res => res.json());
      setTeam(updatedTeam);
    } catch (error) {
      console.error('Failed to list player:', error);
    }
  };

  if (!team) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Team: {team.name}</h2>
        <p>Budget: ${team.budget.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.players.map((player) => (
          <div key={player.id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{player.name}</h3>
            <p>Position: {player.position}</p>
            <p>Value: ${player.price.toLocaleString()}</p>
            {player.isListed ? (
              <p className="text-green-500">Listed for ${player.askingPrice?.toLocaleString()}</p>
            ) : (
              <button
                onClick={() => handleListPlayer(player.id)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                List for Transfer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}