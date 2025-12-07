"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Lock, Unlock, MoreVertical, History } from "lucide-react";
import {
  FaShareAltSquare,
  FaUsersCog,
} from "react-icons/fa";
import { IoEye } from "react-icons/io5";
import { MdDownloadForOffline } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShareLinkModal from "./ShareLinkModal";
import { VaultType } from "@/types/index.t";
import VaultDetailsModal from "./VaultDetailsModal";
import CustodyTrailModal from "./CustodyTrailModal";

function VaultCard({ vault }: { vault: VaultType }) {
  const [openShare, setOpenShare] = useState(false);
  const [viewDetails, setViewDetails] = useState(false);
  const [openCustodyTrail, setOpenCustodyTrail] = useState(false);

  return (
    <Card
      key={vault.id}
      className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(26,115,232,1)] hover:shadow-[12px_12px_0px_0px_rgba(26,115,232,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 !pb-0 p-4 bg-white rounded-2xl"
    >
      <div className="flex flex-col justify-between items-start gap-4">
        {/* ---------------- Header ---------------- */}
        <CardHeader className="!px-0 pb-3 w-full flex flex-row justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 border-3 border-black flex items-center justify-center rounded-2xl ${vault.status === "locked"
                ? "bg-[#1A73E8]"
                : "bg-[#4FC3F7]"
                }`}
            >
              {vault.status === "locked" ? (
                <Lock className="w-5 h-5 text-white" />
              ) : (
                <Unlock className="w-5 h-5 text-black" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-wide">
                {vault.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={
                    vault.status === "locked" ? "destructive" : "default"
                  }
                  className={`border-2 border-black uppercase text-xs font-black rounded-full ${vault.status === "locked"
                    ? "bg-[#1A73E8] text-white"
                    : "bg-[#E3F2FD] text-black"
                    } shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]`}
                >
                  {vault.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs border-2 border-black bg-[#1A73E8] text-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-full"
                >
                  {vault.custodyCount} {vault.custodyCount === 1 ? 'transfer' : 'transfers'}
                </Badge>
              </div>
            </div>
          </div>

          {/* --- Action Menu --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 border-3 border-black bg-[#1A73E8] text-white hover:bg-[#0B2A4A] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-transform duration-100 cursor-pointer rounded-2xl"
              >
                <MoreVertical className="h-5 w-5 font-bold" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 border-3 border-black shadow-[8px_8px_0px_0px_rgba(26,115,232,1)] bg-white rounded-xl"
            >
              <DropdownMenuItem
                className="flex items-center gap-2 font-bold uppercase text-xs hover:bg-[#1A73E8] hover:text-white cursor-pointer"
                onClick={() => setOpenCustodyTrail(true)}
              >
                <History size={18} />
                Custody History
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-2 font-bold uppercase text-xs hover:bg-[#1A73E8] hover:text-white cursor-pointer" onClick={() => setViewDetails(true)}>
                <IoEye size={18} />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-2 font-bold uppercase text-xs hover:bg-[#1A73E8] hover:text-white cursor-pointer"
                onClick={() => setOpenShare(true)}
              >
                <FaShareAltSquare size={18} />
                Share
              </DropdownMenuItem>

              {/* {vault.status === "unlocked" && (
                <DropdownMenuItem className="flex items-center gap-2 font-bold uppercase text-xs hover:bg-[#1A73E8] hover:text-white cursor-pointer">
                  <MdDownloadForOffline size={18} />
                  Download All
                </DropdownMenuItem>
              )} */}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        {/* ---------------- Body ---------------- */}
        <CardContent className="!px-0 space-y-4 w-full">
          {/* ---- Vault Meta ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm font-bold">
            <p>
              <span className="text-black uppercase text-xs">Uploaded:</span>{" "}
              <span className="font-black text-black">
                {vault.uploadDate}
              </span>
            </p>
            <p className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-black" />
              <span className="text-black uppercase text-xs">Unlocks:</span>{" "}
              <span className="font-black text-black">
                {vault.unlockDate}
              </span>
            </p>
          </div>

          {/* ---- File list ---- */}
          <div className="border-3 border-black p-3 bg-[#1A73E8] max-h-40 overflow-y-auto shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-2xl">
            <p className="text-xs font-black text-white mb-2 uppercase tracking-wide">
              Files in vault
            </p>
            <ul className="space-y-2 text-sm">
              {vault.files.map((f) => (
                <li
                  key={f.id}
                  className="flex justify-between items-center border-b-2 border-white/30 last:border-none pb-2 font-bold"
                >
                  <span className="truncate text-white">{f.name}</span>
                  <span className="text-black text-xs font-black bg-[#4FC3F7] px-2 py-1 border-2 border-black rounded-full">
                    {f.size}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Walrus CID ---- */}
          <div className="w-full text-xs font-bold mt-4 border-3 border-black bg-[#0B2A4A] p-3 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <span className="font-black uppercase text-white tracking-wide">
                Walrus CID:
              </span>
              <span className="text-left truncate hover:underline cursor-pointer font-mono text-white">
                {vault.id}
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      <ShareLinkModal
        open={openShare}
        setOpen={setOpenShare}
        id={vault.id}
      />

      <VaultDetailsModal
        onClose={() => setViewDetails(false)}
        vault={vault}
        open={viewDetails}
      />

      <CustodyTrailModal
        open={openCustodyTrail}
        onClose={() => setOpenCustodyTrail(false)}
        custodyTrail={vault.custodyTrail}
        vaultName={vault.title}
      />
    </Card>
  );
}

export default VaultCard;
