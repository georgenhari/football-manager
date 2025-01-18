// src/components/TransferMarket.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Player } from "@prisma/client";
import {
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Search,
  X,
} from "lucide-react";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { showError } from "@/lib/toast";

// Define the filter types
interface TransferFilters {
  playerName?: string;
  teamName?: string;
  maxPrice?: string;
}
type SortField = "name" | "team" | "position" | "askingPrice";
type SortOrder = "asc" | "desc";
interface ListedPlayer extends Player {
  team: {
    name: string;
  };
}

export default function TransferMarket() {
  const [players, setPlayers] = useState<ListedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TransferFilters>({
    playerName: "",
    teamName: "",
    maxPrice: "",
  });

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;

  // Fetch players with filters
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        const response = await fetch(`/api/transfers?${queryParams}`);
        if (!response.ok) throw new Error("Failed to fetch players");
        const data = await response.json();
        setPlayers(data);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (err) {
        showError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, [filters]);

  // Sort and paginate players
  const sortedAndPaginatedPlayers = useMemo(() => {
    // Sort players
    const sorted = [...players].sort((a, b) => {
      const modifier = sortOrder === "asc" ? 1 : -1;

      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name) * modifier;
        case "team":
          return a.team.name.localeCompare(b.team.name) * modifier;
        case "position":
          return a.position.localeCompare(b.position) * modifier;
        case "askingPrice":
          return ((a.askingPrice || 0) - (b.askingPrice || 0)) * modifier;
        default:
          return 0;
      }
    });

    // Paginate
    const startIndex = (currentPage - 1) * playersPerPage;
    return sorted.slice(startIndex, startIndex + playersPerPage);
  }, [players, sortField, sortOrder, currentPage]);

  const totalPages = Math.ceil(players.length / playersPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

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
      await fetch("/api/transfers/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });

      // Refresh players list
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const updatedPlayers = await fetch(`/api/transfers?${queryParams}`).then(
        (res) => res.json()
      );
      setPlayers(updatedPlayers);
    } catch (error) {
      console.error("Failed to buy player:", error);
    }
  };

  const FilterSection = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
      <div className="mb-6">
        {/* Main Search and Filter Toggle */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              value={filters.playerName}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, playerName: e.target.value }))
              }
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all
              ${
                isFilterOpen
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <Filter size={20} />
            <span>Filters</span>
            {(filters.teamName || filters.maxPrice) && (
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {Number(!!filters.teamName) + Number(!!filters.maxPrice)}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filter Section */}
        {isFilterOpen && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Filter Options</h3>
              <button
                onClick={() => {
                  setFilters({ playerName: "", teamName: "", maxPrice: "" });
                  setIsFilterOpen(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X size={16} />
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="Enter team name..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={filters.teamName}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      teamName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="Enter max price..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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

            <div className="flex items-center pt-2 text-sm text-gray-600">
              <Filter size={16} className="mr-2" />
              <span>
                {filters.teamName || filters.maxPrice
                  ? `Showing results for ${[
                      filters.teamName && `team "${filters.teamName}"`,
                      filters.maxPrice && `max price $${filters.maxPrice}`,
                    ]
                      .filter(Boolean)
                      .join(" and ")}`
                  : "No filters applied"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <FilterSection />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: "name", label: "Player" },
                    { key: "team", label: "Team" },
                    { key: "position", label: "Position" },
                    { key: "askingPrice", label: "Asking Price" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(key as SortField)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{label}</span>
                        {sortField === key &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndPaginatedPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {player.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{player.team.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
          ${player.position === "GK" ? "bg-yellow-100 text-yellow-800" : ""}
          ${player.position === "DEF" ? "bg-blue-100 text-blue-800" : ""}
          ${player.position === "MID" ? "bg-green-100 text-green-800" : ""}
          ${player.position === "ATT" ? "bg-red-100 text-red-800" : ""}
        `}
                      >
                        {player.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        ${player.askingPrice?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleBuy(player.id)}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
                      >
                        Buy Player
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedAndPaginatedPlayers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No players found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-lg">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing {(currentPage - 1) * playersPerPage + 1} to{" "}
                {Math.min(currentPage * playersPerPage, players.length)} of{" "}
                {players.length} players
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsLeft size={20} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
