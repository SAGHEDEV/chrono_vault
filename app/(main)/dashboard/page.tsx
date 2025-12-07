"use client";

import FileCard from "@/components/miscellaneous/FileCard";
import StatCard from "@/components/miscellaneous/StatCard";
import { useVaultStats, useRecentVaults } from "@/hooks/useUserVaults";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { BarChart3, Clock, Lock, Unlock, Loader2 } from "lucide-react";
import Link from "next/link";
import React from "react";

const VaultDashboard: React.FC = () => {
  const currentAccount = useCurrentAccount();

  // Use custom hooks for cleaner code
  const { stats, isLoading: statsLoading } = useVaultStats();
  const { vaults: recentVaults, isLoading: vaultsLoading } = useRecentVaults(2);

  const isLoading = statsLoading || vaultsLoading;

  console.log(recentVaults)

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600 font-bold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // No wallet connected
  if (!currentAccount?.address) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-screen">
        <div className="text-center brutalist-card p-8">
          <Lock className="h-12 w-12 text-[#0A0A0A] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#0A0A0A] mb-4 uppercase">
            Wallet Not Connected
          </h2>
          <p className="text-[#0A0A0A] font-bold">
            Please connect your wallet to view your vaults
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="brutalist-card p-6">
        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase">Welcome back! 👋</h2>
        <p className="text-[#0A0A0A] mt-2 font-bold">
          {currentAccount.address.slice(0, 6)}...
          {currentAccount.address.slice(-4)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Vaults"
          value={stats.total}
          Icon={<BarChart3 size={24} />}
          accent="#1A73E8"
        />
        <StatCard
          label="Locked"
          value={stats.locked}
          Icon={<Lock size={24} />}
          accent="#FF3B30"
        />
        <StatCard
          label="Unlocked"
          value={stats.unlocked}
          Icon={<Unlock size={24} />}
          accent="#00ff00"
        />
        <StatCard
          label="Unlocking Soon"
          value={stats.pending}
          Icon={<Clock size={24} />}
          accent="#4FC3F7"
        />
      </div>

      {/* Additional Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Files */}
          <div className="brutalist-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#0A0A0A] uppercase mb-2">Total Files</p>
                <p className="text-3xl font-black text-[#0A0A0A]">
                  {stats.totalFiles}
                </p>
              </div>
              <div className="p-3 bg-[#E3F2FD] brutalist-border rounded-2xl">
                <BarChart3 className="h-6 w-6 text-[#0A0A0A]" />
              </div>
            </div>
          </div>

          {/* Next Unlock */}
          <div className="brutalist-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#0A0A0A] uppercase mb-2">Next Unlock</p>
                <p className="text-3xl font-black text-[#0A0A0A]">
                  {stats.daysUntilNextUnlock === null
                    ? "None"
                    : stats.daysUntilNextUnlock < 1
                      ? "< 1 day"
                      : `${stats.daysUntilNextUnlock} days`}
                </p>
              </div>
              <div className="p-3 bg-[#4FC3F7] brutalist-border rounded-2xl">
                <Clock className="h-6 w-6 text-[#0A0A0A]" />
              </div>
            </div>
          </div>

          {/* Encrypted Storage */}
          <div className="brutalist-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#0A0A0A] uppercase mb-2">On Walrus</p>
                <p className="text-3xl font-black text-[#0A0A0A]">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-[#0B2A4A] brutalist-border rounded-2xl">
                <Unlock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Vaults Section */}
      <div className="brutalist-card p-6 flex flex-col gap-6">
        <div className="w-full flex justify-between items-center">
          <h2 className="text-2xl font-black text-[#0A0A0A] uppercase">
            Recently Created Vaults
          </h2>

          <Link
            href={"/vaults"}
            className="py-2 px-6 bg-[#1A73E8] text-white brutalist-btn text-sm cursor-pointer"
          >
            View All Vaults
          </Link>
        </div>

        {recentVaults.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-[#0A0A0A]" />
            <p className="text-xl font-black text-[#0A0A0A] uppercase">No vaults yet</p>
            <p className="text-sm mt-2 font-bold text-[#0A0A0A]">
              Create your first vault to get started!
            </p>
            <Link
              href="/upload"
              className="inline-block mt-6 px-8 py-3 bg-[#4FC3F7] text-[#0A0A0A] brutalist-btn cursor-pointer"
            >
              Create Vault
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentVaults.map((vault) => (
              <FileCard vault={vault} key={vault.id} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default VaultDashboard;
