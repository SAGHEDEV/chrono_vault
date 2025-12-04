import React from "react";
import { Button } from "../ui/button";
import { Bell, Search } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { TbWalletOff } from "react-icons/tb";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";

function Header() {
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet();
  return (
    <header className="border-b-4 border-[#0A0A0A] bg-transparent pb-4 mb-4 flex items-center justify-between">
      <div className="hidden lg:flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#0A0A0A] w-5 h-5" />
          <input
            placeholder="SEARCH FILES..."
            className="pl-12 bg-white brutalist-border focus:outline-none w-full py-3 px-4 text-sm font-bold placeholder:text-[#0A0A0A] placeholder:font-bold uppercase rounded-2xl"
          />
        </div>
      </div>

      <div className="w-full lg:w-fit flex justify-between lg:justify-end items-center gap-3">
        <Button variant="ghost" size="icon" className="brutalist-border hover:bg-[#4FC3F7] p-3 rounded-full">
          <Bell className="w-6 h-6" />
        </Button>

        <div className="flex items-center gap-2 max-w-[200px] brutalist-border p-1 bg-white cursor-pointer hover:bg-[#4FC3F7] transition-colors rounded-full">
          <div className="p-3 bg-[#1A73E8] text-white flex justify-center items-center rounded-full">
            <FaUser />
          </div>
          <div className="w-full truncate text-xs font-bold px-2">
            {currentAccount?.address}
          </div>
          <div onClick={() => { disconnect() }} className="p-3 bg-[#FF3B30] text-white flex justify-center items-center transition-transform active:scale-90 cursor-pointer rounded-full" title="Disconnect Wallet">
            <TbWalletOff />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
