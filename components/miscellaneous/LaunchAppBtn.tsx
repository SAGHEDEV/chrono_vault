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
        className=" py-3 bg-black text-white rounded-full hover:scale-105 transition duration-300 active:scale-95 cursor-pointer flex gap-4 items-center justify-center min-w-[280px] hover:shadow-2xl"
      >
        Launch App{" "}
        <span className="rounded-full bg-white text-black p-2 transition duration-300">
          <FaArrowRight size={16} />
        </span>
      </button>
      <ConnectWalletModal open={isModalOpen} setOpen={setIsModalOpen} />
    </div>
  );
}

export default LaunchAppBtn;
