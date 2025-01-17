'use client';

import { useEffect, useState } from 'react';
import { Player } from '@prisma/client';
import { AlertCircle } from 'lucide-react';
import router from 'next/router';

interface PositionRequirement {
  min: number;
  max: number;
  label: string;
}

const POSITION_REQUIREMENTS: Record<string, PositionRequirement> = {
  GK: { min: 2, max: 3, label: 'Goalkeepers' },
  DEF: { min: 5, max: 8, label: 'Defenders' },
  MID: { min: 5, max: 8, label: 'Midfielders' },
  ATT: { min: 3, max: 6, label: 'Attackers' }
};

export default function CreateTeam() {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available players
  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await fetch('/api/players/available');
      const data = await response.json();
      setAvailablePlayers(data);
    };
    fetchPlayers();
  }, []);

  const getPositionCount = (position: string) => 
    selectedPlayers.filter(p => p.position === position).length;

  const isValidTeam = () => {
    // Check total players
    if (selectedPlayers.length < 15 || selectedPlayers.length > 25) return false;

    // Check minimum requirements for each position
    return Object.entries(POSITION_REQUIREMENTS).every(([pos, req]) => {
      const count = getPositionCount(pos);
      return count >= req.min;
    });
  };

  const handlePlayerToggle = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(current => current.filter(p => p.id !== player.id));
    } else {
      if (selectedPlayers.length >= 25) {
        setError('Maximum team size is 25 players');
        return;
      }
      setSelectedPlayers(current => [...current, player]);
    }
    setError(null);
  };

  const handleCreateTeam = async () => {
    try {
      const response = await fetch('/api/team/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          players: selectedPlayers.map(p => p.id)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      // Redirect to dashboard or show success message
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to create team');
    }
  };

  return (
    <div className="space-y-6">
      {/* Position Requirements Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(POSITION_REQUIREMENTS).map(([pos, req]) => {
          const count = getPositionCount(pos);
          return (
            <div 
              key={pos} 
              className={`p-4 rounded-lg border ${
                count >= req.min ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="text-sm font-medium">{req.label}</div>
              <div className="text-xl font-bold">
                {count}/{req.min}-{req.max}
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Available Players</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {availablePlayers.map(player => (
              <button
                key={player.id}
                onClick={() => handlePlayerToggle(player)}
                className="w-full p-3 rounded-lg border hover:bg-gray-50 flex justify-between items-center"
                disabled={selectedPlayers.length >= 25 && !selectedPlayers.find(p => p.id === player.id)}
              >
                <div>
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-gray-500">{player.position}</div>
                </div>
                <div className="text-sm font-medium">
                  ${player.price.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Selected Players ({selectedPlayers.length})</h3>
          <div className="space-y-2">
            {selectedPlayers.map(player => (
              <button
                key={player.id}
                onClick={() => handlePlayerToggle(player)}
                className="w-full p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-gray-500">{player.position}</div>
                </div>
                <div className="text-sm font-medium">
                  ${player.price.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <button
        onClick={() => isValidTeam() && setShowModal(true)}
        disabled={!isValidTeam()}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Create Team
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Warning</h3>
            <p className="text-gray-600 mb-6">
              Creating a new team will override your current team. This action cannot be undone. 
              Are you sure you want to continue?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Create New Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}