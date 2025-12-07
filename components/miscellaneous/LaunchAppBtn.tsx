"use client";

import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import ConnectWalletModal from "./ConnectWalletModal";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";

function LaunchAppBtn() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentAccount = useCurrentAccount();
  return (
    <div className="w-full flex justify-center items-center">
      <button
        onClick={() => {
          if (currentAccount) {
            router.push("/dashboard");
          } else {
            setIsModalOpen(true);
          }
        }}
        className="py-2 px-8 bg-[#1A73E8] text-white brutalist-btn flex gap-4 items-center justify-center min-w-[320px] font-black text-lg cursor-pointer"
      >
        Launch App{" "}
        <span className="bg-[#4FC3F7] text-[#0A0A0A] p-3 brutalist-border rounded-full">
          <FaArrowRight size={20} />
        </span>
      </button>
      <ConnectWalletModal open={isModalOpen} setOpen={setIsModalOpen} />
    </div>
  );
}

export default LaunchAppBtn;
