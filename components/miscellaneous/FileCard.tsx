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
import { Clock, Lock, Unlock, MoreVertical } from "lucide-react";
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

function VaultCard({ vault }: { vault: VaultType }) {
  const [openShare, setOpenShare] = useState(false);

  return (
    <Card
      key={vault.id}
      className="shadow-card border-border hover:shadow-elegant transition-shadow !pb-0 p-4"
    >
      <div className="flex flex-col justify-between items-start gap-4">
        {/* ---------------- Header ---------------- */}
        <CardHeader className="!px-0 pb-3 w-full flex flex-row justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                vault.status === "locked"
                  ? "bg-destructive/10"
                  : "bg-orange-400/10"
              }`}
            >
              {vault.status === "locked" ? (
                <Lock className="w-5 h-5 text-destructive" />
              ) : (
                <Unlock className="w-5 h-5 text-orange-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{vault.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    vault.status === "locked" ? "destructive" : "default"
                  }
                >
                  {vault.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {vault.custodyCount} custody transfer
                  {vault.custodyCount !== 1 ? "s" : ""}
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
                className="h-8 w-8 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="flex items-center gap-2">
                <FaUsersCog size={18} />
                Verify Custodian
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-2">
                <IoEye size={18} />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => setOpenShare(true)}
              >
                <FaShareAltSquare size={18} />
                Share
              </DropdownMenuItem>

              {vault.status === "unlocked" && (
                <DropdownMenuItem className="flex items-center gap-2">
                  <MdDownloadForOffline size={18} />
                  Download All
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        {/* ---------------- Body ---------------- */}
        <CardContent className="!px-0 space-y-4 w-full">
          {/* ---- Vault Meta ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
            <p>
              <span className="text-muted-foreground">Uploaded:</span>{" "}
              <span className="font-semibold text-gray-700">
                {vault.uploadDate}
              </span>
            </p>
            <p className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Unlocks:</span>{" "}
              <span className="font-semibold text-gray-700">
                {vault.unlockDate}
              </span>
            </p>
          </div>

          {/* ---- File list ---- */}
          <div className="border rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Files in vault
            </p>
            <ul className="space-y-1 text-sm">
              {vault.files.map((f) => (
                <li
                  key={f.id}
                  className="flex justify-between items-center border-b border-gray-200 last:border-none pb-1"
                >
                  <span className="truncate">{f.name}</span>
                  <span className="text-gray-500 text-xs">{f.size}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Walrus CID ---- */}
          <div className="w-full text-xs text-muted-foreground mt-4 flex items-center justify-between gap-4">
            <span className="font-mono w-full">Walrus CID:</span>
            <span className=" text-left truncate hover:underline cursor-pointer">
              {vault.walrusCid}
            </span>
          </div>
        </CardContent>
      </div>

      <ShareLinkModal
        open={openShare}
        setOpen={setOpenShare}
        id={vault.walrusCid}
      />
    </Card>
  );
}

export default VaultCard;
