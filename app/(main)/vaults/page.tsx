"use client";

import FileCard from "@/components/miscellaneous/FileCard";
import { useUserVaults } from "@/hooks/useUserVaults";
import { Loader2, Search } from "lucide-react";
import React, { useState, useMemo } from "react";

function VaultsPage() {
  const [currentFilter, setCurrentFilter] = useState<"all" | "locked" | "unlocked" | "pending">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all vaults
  const { vaults, isLoading, error } = useUserVaults();

  // Apply filtering and searching
  const filteredVaults = useMemo(() => {
    let result = vaults;

    // Apply status filter
    if (currentFilter === "locked") {
      result = result.filter((v) => v.status === "locked");
    } else if (currentFilter === "unlocked") {
      result = result.filter((v) => v.status === "unlocked");
    } else if (currentFilter === "pending") {
      const now = Date.now();
      const oneDayFromNow = now + 24 * 60 * 60 * 1000;
      result = result.filter((v) => {
        if (!v.unlockDate) return false;
        return Date.parse(String(v.unlockDate)) > now && Date.parse(String(v.unlockDate)) <= oneDayFromNow;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (vault) =>
          vault.title.toLowerCase().includes(term) ||
          vault.description.toLowerCase().includes(term)
      );
    }

    return result;
  }, [vaults, currentFilter, searchTerm]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#0A0A0A] mx-auto" />
          <p className="mt-4 text-[#0A0A0A] font-bold">Loading vaults...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full p-6 flex items-center justify-center h-full flex-1">
        <div className="text-center brutalist-card p-8 bg-[#FF3B30]">
          <p className="text-black font-black uppercase text-xl">Error loading vaults</p>
          <p className="text-sm text-black font-bold mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 flex flex-col gap-8">
      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="brutalist-card p-6">
          <h2 className="text-3xl font-black text-[#0A0A0A] uppercase">
            All Vaults ({filteredVaults.length})
          </h2>
        </div>

        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#0A0A0A] h-5 w-5" />
            <input
              type="text"
              placeholder="SEARCH VAULTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:min-w-[400px] pl-12 pr-4 py-3 brutalist-border focus:outline-none font-bold uppercase placeholder:text-gray-400 rounded-2xl"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {["all", "unlocked", "locked"].map((status) => (
              <button
                key={status}
                className={`px-6 py-3 text-sm font-black transition cursor-pointer brutalist-border uppercase tracking-wide rounded-2xl ${currentFilter === status
                  ? "bg-[#1A73E8] text-white brutalist-shadow-sm"
                  : "bg-white hover:bg-[#4FC3F7] hover:translate-x-1"
                  }`}
                onClick={() => setCurrentFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vaults Grid */}
      {filteredVaults.length === 0 ? (
        <div className="text-center py-16 brutalist-card p-8">
          <p className="text-2xl font-black text-[#0A0A0A] uppercase">
            {searchTerm
              ? `No vaults found matching "${searchTerm}"`
              : currentFilter === "all"
                ? "No vaults yet"
                : `No ${currentFilter} vaults`}
          </p>
          <p className="text-sm mt-4 font-bold text-[#0A0A0A]">
            {vaults.length === 0
              ? "Create your first vault to get started!"
              : "Try adjusting your filters or search term"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVaults.map((vault) => (
            <FileCard vault={vault} key={vault.id} />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {vaults.length > 0 && (
        <div className="mt-6 p-6 brutalist-card bg-[#F5F5F5]">
          <p className="text-sm text-[#0A0A0A] font-black uppercase">
            Showing {filteredVaults.length} of {vaults.length} total vaults
          </p>
        </div>
      )}
    </div>
  );
}

export default VaultsPage;
