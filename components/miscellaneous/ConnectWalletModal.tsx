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
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogTitle className="w-= h-0" />
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              <h3 className="text-3xl font-bold text-center">Connect Wallet!</h3>
              <p className="text-sm text-gray-600 text-center mt-1">
                Your wallet has to be connected to proceed to launch the
                application.
              </p>
            </div>
            <div className="w-full">
              <div className="w-full flex flex-col gap-2 mt-4">
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
                    className="w-full border bg-white cursor-pointer text-black h-10 hover:bg-gray-100 active:scale-95 transition duration-300 flex items-center gap-3"
                  >
                    <Image
                      src={wallet.icon}
                      alt={wallet.name}
                      width={20}
                      height={20}
                    />
                    Connect {wallet.name} Wallet
                  </Button>
                )) : <p className="text-sm text-center text-gray-600 font-semibold">No wallet was found! Install a wallet to continue </p>}

                <div className="w-full flex items-center justify-center gap-3">
                  <div className="w-full h-0.5 bg-gray-200"></div>
                  <div className="text-lg font-semibold text-black">or</div>
                  <div className="w-full h-0.5 bg-gray-200"></div>
                </div>
                <div className="w-full flex flex-col items-center gap-3">
                  <Button disabled className="w-full border bg-white cursor-pointer text-black h-10 hover:bg-gray-100 active:scale-95 transition duration-300 flex items-center gap-3">
                    <FcGoogle size={25} />
                    Continue with Google
                  </Button>

                  <Button disabled className="w-full border bg-white cursor-pointer text-black h-10 hover:bg-gray-100 active:scale-95 transition duration-300 flex items-center gap-3">
                    <FaFacebook size={25} className="text-blue-500" />
                    Continue with Facebook
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
