import FileCard from "@/components/miscellaneous/FileCard";
import StatCard from "@/components/miscellaneous/StatCard";
import { VaultType } from "@/types/index.t";
import { BarChart3, Clock, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import React from "react";

type VaultStatus = "Locked" | "Unlocked" | "Pending Transfer";

interface VaultItem {
  id: string;
  name: string;
  status: VaultStatus;
  unlockTime?: string; // ISO string or human readable
  custodyTrail: string[]; // wallet short-ids
}

const mockVaults: VaultType[] = [
  {
    id: "vault-001",
    title: "Research Archive – Q3 Findings",
    description: "Contains the final research paper and related appendices.",
    uploadDate: "2024-09-20",
    unlockDate: "2024-09-25",
    status: "locked",
    custodyCount: 1,
    walrusCid: "bafk...xyz123",
    files: [
      { id: "f1", name: "Research_Paper_Final.pdf", size: "2.4 MB" },
      { id: "f2", name: "Appendix_A.xlsx", size: "1.1 MB" },
    ],
  },
  {
    id: "vault-002",
    title: "Contract & Legal Docs",
    description: "Signed contracts and NDAs from September review.",
    uploadDate: "2024-09-15",
    unlockDate: "2024-09-20",
    status: "unlocked",
    custodyCount: 3,
    walrusCid: "bafk...def789",
    files: [
      { id: "f3", name: "Contract_Review.pdf", size: "3.2 MB" },
      { id: "f4", name: "NDA_Signed.pdf", size: "0.8 MB" },
    ],
  },
];

const StatusBadge: React.FC<{ status: VaultStatus }> = ({ status }) => {
  const colors: Record<VaultStatus, string> = {
    Locked: "bg-red-100 text-red-700",
    Unlocked: "bg-green-100 text-green-700",
    "Pending Transfer": "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}
    >
      {status}
    </span>
  );
};

const VaultDashboard: React.FC = () => {
  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-black">Welcome back! 👋</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          label="Total Vaults"
          value={mockVaults.length}
          Icon={<BarChart3 size={20} />}
          accent="#4B0082"
        />
        <StatCard
          label="Locked"
          value={mockVaults.filter((v) => v.status === "locked").length}
          Icon={<Lock size={20} />}
          accent="#ff0000"
        />
        <StatCard
          label="Unlocked"
          value={mockVaults.filter((v) => v.status === "unlocked").length}
          Icon={<Unlock size={20} />}
          accent="#00ff00"
        />
        <StatCard
          label="Pending"
          value={mockVaults.filter((v) => v.status === "pending").length}
          Icon={<Clock size={20} />}
          accent="#FFFF00"
        />
      </div>

      {/* Vault List */}
      <div className="overflow-x-auto border rounded-xl shadow p-6 flex flex-col gap-6">
        <div className="w-full flex justify-between items-center">
          <h2 className="text-xl font-bold text-black">
            Recently Updated File Vaults
          </h2>

          <Link href={"/vaults"} className="p-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-300 text-sm font-medium">View All Vaults</Link>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {mockVaults.map((file) => (
            <FileCard vault={file} key={file.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VaultDashboard;
