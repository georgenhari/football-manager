// src/components/TeamManagement.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Team, Player } from "@prisma/client";
import { Search, SortAsc, SortDesc } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

type SortField = "name" | "position" | "price" | "status";
type SortOrder = "asc" | "desc";

export default function TeamManagement() {
  const [team, setTeam] = useState<Team & { players: Player[] }>();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/team");
        if (!response.ok) throw new Error("Failed to fetch team data");
        const data = await response.json();
        setTeam(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const handleListPlayer = async (playerId: string) => {
    const askingPrice = prompt("Enter asking price:");
    if (!askingPrice) return;

    try {
      await fetch("/api/transfers/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          askingPrice: parseFloat(askingPrice),
        }),
      });

      const updatedTeam = await fetch("/api/team").then((res) => res.json());
      setTeam(updatedTeam);
    } catch (error) {
      console.error("Failed to list player:", error);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const togglePositionFilter = (position: string) => {
    setPositionFilter((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const filteredAndSortedPlayers = useMemo(() => {
    if (!team?.players) return [];

    let filtered = team.players;

    // Search filter
    if (search) {
      filtered = filtered.filter((player) =>
        player.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Position filter
    if (positionFilter.length > 0) {
      filtered = filtered.filter((player) =>
        positionFilter.includes(player.position)
      );
    }

    // Sorting
    return [...filtered].sort((a, b) => {
      const modifier = sortOrder === "asc" ? 1 : -1;

      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name) * modifier;
        case "position":
          return a.position.localeCompare(b.position) * modifier;
        case "price":
          return (a.price - b.price) * modifier;
        case "status":
          return ((a.isListed ? 1 : 0) - (b.isListed ? 1 : 0)) * modifier;
        default:
          return 0;
      }
    });
  }, [team?.players, search, sortField, sortOrder, positionFilter]);

  if (!team) return <div>Loading...</div>;

  const positions = ["GK", "DEF", "MID", "ATT"];

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded">
        {error}
      </div>
    );
  }

  if (isLoading || !team) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Team: {team.name}</h2>
        <p className="text-lg text-gray-700">
          Budget: ${team.budget.toLocaleString()}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search players..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => togglePositionFilter(pos)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors
                  ${
                    positionFilter.includes(pos)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: "name", label: "Name" },
                { key: "position", label: "Position" },
                { key: "price", label: "Value" },
                { key: "status", label: "Status" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left"
                  onClick={() => toggleSort(key as SortField)}
                >
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {label}
                    </span>
                    {sortField === key ? (
                      sortOrder === "asc" ? (
                        <SortAsc size={16} className="text-blue-500" />
                      ) : (
                        <SortDesc size={16} className="text-blue-500" />
                      )
                    ) : (
                      <SortAsc
                        size={16}
                        className="text-gray-400 opacity-0 group-hover:opacity-100"
                      />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{player.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      player.position === "GK"
                        ? "bg-yellow-100 text-yellow-800"
                        : ""
                    }
                    ${
                      player.position === "DEF"
                        ? "bg-blue-100 text-blue-800"
                        : ""
                    }
                    ${
                      player.position === "MID"
                        ? "bg-green-100 text-green-800"
                        : ""
                    }
                    ${
                      player.position === "ATT" ? "bg-red-100 text-red-800" : ""
                    }
                  `}
                  >
                    {player.position}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  ${player.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {player.isListed ? (
                    <span className="text-green-600">
                      Listed for ${player.askingPrice?.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Not Listed</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!player.isListed && (
                    <button
                      onClick={() => handleListPlayer(player.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      List for Transfer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
