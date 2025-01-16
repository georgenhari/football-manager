// src/components/TransferMarket.tsx
'use client';

import { useState, useEffect } from 'react';
import { Player } from '@prisma/client';

// Define the filter types
interface TransferFilters {
  playerName?: string;
  teamName?: string;
  maxPrice?: string;
}

export default function TransferMarket() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filters, setFilters] = useState<TransferFilters>({
    playerName: '',
    teamName: '',
    maxPrice: ''
  });

  useEffect(() => {
    // Create URLSearchParams with proper type checking
    const queryParams = new URLSearchParams();
    
    // Only add defined filter values
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    fetch(`/api/transfers?${queryParams}`)
      .then((res) => res.json())
      .then(setPlayers);
  }, [filters]);

  const handleBuy = async (playerId: string) => {
    try {
      await fetch('/api/transfers/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      // Refresh players list
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const updatedPlayers = await fetch(`/api/transfers?${queryParams}`)
        .then(res => res.json());
      setPlayers(updatedPlayers);
    } catch (error) {
      console.error('Failed to buy player:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 grid grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Player name"
          className="border p-2 rounded"
          onChange={(e) => setFilters(f => ({ ...f, playerName: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Team name"
          className="border p-2 rounded"
          onChange={(e) => setFilters(f => ({ ...f, teamName: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Max price"
          className="border p-2 rounded"
          onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div key={player.id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{player.name}</h3>
            <p>Position: {player.position}</p>
            <p>Asking Price: ${player.askingPrice?.toLocaleString()}</p>
            <button
              onClick={() => handleBuy(player.id)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Buy Player
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}