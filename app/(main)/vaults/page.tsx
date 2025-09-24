"use client";

import FileCard from "@/components/miscellaneous/FileCard";
import React, { useState } from "react";



import { VaultType } from "@/types/index.t";
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

function Page() {
  const [currentFilter, setCurrentFilter] = useState("All");
  return (
    <div className="w-full p-6 flex flex-col gap-10">
      <div className="flex justify-between items-center gap-10">
        <h2 className="text-2xl font-bold text-black">All Files Overview</h2>
        <div className="flex items-center gap-3 justify-end">
          {["All", "Unlocked", "Locked", "Deleted"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                currentFilter === status
                  ? "bg-black text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setCurrentFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {mockVaults.map((file) => (
          <FileCard vault={file} key={file.id} />
        ))}
      </div>
    </div>
  );
}

export default Page;
