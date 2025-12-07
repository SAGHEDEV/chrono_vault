// "use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { useConnectWallet, useWallets } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

function ConnectWalletModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const { mutate: handleConnectWallet } = useConnectWallet();
  const wallets = useWallets();
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md brutalist-card p-8 border-2">
          <DialogTitle className="w-0 h-0 hidden" />
          <div className="flex flex-col items-center justify-center gap-6">
            <div>
              <h3 className="text-3xl font-black text-center uppercase text-[#0A0A0A]">Connect Wallet!</h3>
              <p className="text-sm text-[#0A0A0A] font-bold text-center mt-2">
                Your wallet has to be connected to proceed to launch the
                application.
              </p>
            </div>
            <div className="w-full">
              <div className="w-full flex flex-col gap-3 mt-4">
                {Array.isArray(wallets) && wallets.length !== 0 ? wallets.map((wallet) => (
                  <Button
                    key={wallet.name}
                    onClick={() => {
                      handleConnectWallet(
                        { wallet },
                        {
                          onSuccess: () => router.push("/dashboard"),
                        }
                      );
                    }}
                    className="w-full brutalist-btn bg-white text-[#0A0A0A] h-12 hover:bg-[#4FC3F7] hover:translate-x-1 transition-all flex items-center gap-3 border-2 shadow-[4px_4px_0px_#0A0A0A] cursor-pointer"
                  >
                    <Image
                      src={wallet.icon}
                      alt={wallet.name}
                      width={24}
                      height={24}
                    />
                    CONNECT {wallet.name.toUpperCase()} WALLET
                  </Button>
                )) : <p className="text-sm text-center text-[#0A0A0A] font-bold">No wallet was found! Install a wallet to continue </p>}

                <div className="w-full flex items-center justify-center gap-3 my-2">
                  <div className="w-full h-0.5 bg-[#0A0A0A]"></div>
                  <div className="text-lg font-black text-[#0A0A0A] uppercase">or</div>
                  <div className="w-full h-0.5 bg-[#0A0A0A]"></div>
                </div>
                <div className="w-full flex flex-col items-center gap-3">
                  <Button disabled className="w-full brutalist-btn bg-white text-[#0A0A0A] h-12 opacity-50 cursor-not-allowed flex items-center gap-3 border-2 shadow-[4px_4px_0px_#0A0A0A]">
                    <FcGoogle size={24} />
                    CONTINUE WITH GOOGLE
                  </Button>

                  <Button disabled className="w-full brutalist-btn bg-white text-[#0A0A0A] h-12 opacity-50 cursor-not-allowed flex items-center gap-3 border-2 shadow-[4px_4px_0px_#0A0A0A]">
                    <FaFacebook size={24} className="text-blue-500" />
                    CONTINUE WITH FACEBOOK
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ConnectWalletModal;
