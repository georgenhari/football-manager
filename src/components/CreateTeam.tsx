"use client";

import { Search, Filter, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Player } from "@prisma/client";
import { showError, showSuccess } from "@/lib/toast";

interface PositionRequirement {
  min: number;
  max: number;
  label: string;
}

interface Filters {
  search: string;
  position: string[];
  maxPrice: string;
  minPrice: string;
}

const POSITION_REQUIREMENTS: Record<string, PositionRequirement> = {
  GK: { min: 2, max: 3, label: "Goalkeepers" },
  DEF: { min: 5, max: 8, label: "Defenders" },
  MID: { min: 5, max: 8, label: "Midfielders" },
  ATT: { min: 3, max: 6, label: "Attackers" },
};

export default function CreateTeam() {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({
    search: "",
    position: [],
    maxPrice: "",
    minPrice: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter((player) => {
      // Name search
      if (
        filters.search &&
        !player.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Position filter
      if (
        filters.position.length > 0 &&
        !filters.position.includes(player.position)
      ) {
        return false;
      }

      // Price range
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice
        ? parseFloat(filters.maxPrice)
        : Infinity;
      if (player.price < minPrice || player.price > maxPrice) {
        return false;
      }

      return true;
    });
  }, [availablePlayers, filters]);

  // Fetch available players
  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await fetch("/api/players/available");
      console.log("response", response);

      const data = await response.json();
      setAvailablePlayers(data);
    };
    fetchPlayers();
  }, []);

  const getPositionCount = (position: string) =>
    selectedPlayers.filter((p) => p.position === position).length;

  const isValidTeam = () => {
    // Check total players
    if (selectedPlayers.length < 15 || selectedPlayers.length > 25)
      return false;

    // Check minimum requirements for each position
    return Object.entries(POSITION_REQUIREMENTS).every(([pos, req]) => {
      const count = getPositionCount(pos);
      return count >= req.min;
    });
  };

  const handlePlayerToggle = (player: Player) => {
    if (selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers((current) =>
        current.filter((p) => p.id !== player.id)
      );
    } else {
      if (selectedPlayers.length >= 25) {
        showError("Maximum team size is 25 players");
        return;
      }
      setSelectedPlayers((current) => [...current, player]);
    }
  };

  const handleCreateTeam = async () => {
    try {
      const response = await fetch("/api/team/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          players: selectedPlayers.map((p) => p.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      // Redirect to dashboard or show success message
      router.push("/dashboard");
      showSuccess("Team created successfully!");
    } catch (error) {
      console.log(`Failed to create team ${error}`);
      showError(
        error instanceof Error ? error.message : "Failed to create team"
      );
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
                count >= req.min
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
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
          {/* Filter Section */}
          <div className="space-y-4 mb-4">
            {/* Search and Filter Toggle */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search players..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                  showFilters
                    ? "bg-blue-50 border-blue-500 text-blue-600"
                    : "border-gray-200"
                }`}
              >
                <Filter size={20} />
                <span>Filters</span>
                {(filters.position.length > 0 ||
                  filters.minPrice ||
                  filters.maxPrice) && (
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {filters.position.length +
                      Number(!!filters.minPrice) +
                      Number(!!filters.maxPrice)}
                  </span>
                )}
              </button>
            </div>

            {/* Expandable Filter Section */}
            {showFilters && (
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
                {/* Filter Header */}
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Filter Options</h4>
                  <button
                    onClick={() =>
                      setFilters({
                        search: "",
                        position: [],
                        maxPrice: "",
                        minPrice: "",
                      })
                    }
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <X size={16} />
                    Clear all
                  </button>
                </div>

                {/* Position Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Position
                  </label>
                  <div className="flex gap-2">
                    {["GK", "DEF", "MID", "ATT"].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            position: prev.position.includes(pos)
                              ? prev.position.filter((p) => p !== pos)
                              : [...prev.position, pos],
                          }));
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          filters.position.includes(pos)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="position"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Min Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="Min price"
                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minPrice: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="position"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Max Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="Max price"
                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxPrice: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => handlePlayerToggle(player)}
                className="w-full p-3 rounded-lg border hover:bg-gray-50 flex justify-between items-center"
                disabled={
                  selectedPlayers.length >= 25 &&
                  !selectedPlayers.find((p) => p.id === player.id)
                }
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
          <h3 className="text-lg font-medium mb-4">
            Selected Players ({selectedPlayers.length})
          </h3>
          <div className="space-y-2">
            {selectedPlayers.map((player) => (
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
              Creating a new team will override your current team. This action
              cannot be undone. Are you sure you want to continue?
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
