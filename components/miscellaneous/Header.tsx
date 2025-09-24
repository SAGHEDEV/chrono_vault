import React from "react";
import { Button } from "../ui/button";
import { Bell, Search } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { TbWalletOff } from "react-icons/tb";
import { useDisconnectWallet } from "@mysten/dapp-kit";

function Header() {
    const { mutate: disconnect } = useDisconnectWallet();
  return (
    <header className="border-b border-border bg-card pb-3 flex items-center justify-between">
      <div className="hidden lg:flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            placeholder="Search files..."
            className="pl-10 bg-background border-input focus:ring-2 focus:ring-ring focus:outline-none rounded-lg border w-full py-3 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="w-full lg:w-fit flex justify-between lg:justify-end items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2 max-w-[180px] rounded-full p-1 bg-gray-100 cursor-pointer hover:shadow-sm transition duration-300">
          <div className="p-2 bg-black text-white flex justify-center items-center rounded-full">
            <FaUser />
          </div>
          <div className="w-full truncate text-sm">
            0xf5565117d38f036cea62b1717817a8539603dd5d72abad09599e292a51da270f
          </div>
          <div onClick={()=>{disconnect()}} className="p-2 bg-red-400 text-white flex justify-center items-center rounded-full transition duration-300 active:scale-95" title="Disconnect Wallet">
            <TbWalletOff />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
