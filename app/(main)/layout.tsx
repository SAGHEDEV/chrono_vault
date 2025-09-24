"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Logo from "@/components/miscellaneous/Logo";
import SideBar from "@/components/miscellaneous/SideBar";
import Header from "@/components/miscellaneous/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const account = useCurrentAccount();

  useEffect(() => {
    if (!account) {
      router.push("/");
    }
  }, [account]);

  return (
    <div className="w-full h-full flex-1 flex gap-4 p-6">
      <SideBar />
      {/* Main content */}
      <main className="flex-1 w-full h-full max-h-full overflow-auto bg-white border border-border rounded-xl p-4 flex flex-col shadow-lg">
        <Header />
        {children}
      </main>
    </div>
  );
}
