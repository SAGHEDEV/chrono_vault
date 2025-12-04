import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import Logo from "./Logo";

function SideBar() {
  const pathname = usePathname();
  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Vaults", href: "/vaults" },
    { name: "Create Vault", href: "/upload" },
  ];
  return (
    <div className="w-full max-w-[260px] bg-white brutalist-border p-6 rounded-2xl">
      <div className="flex flex-col gap-8">
        <div className="pb-6 border-b-4 border-[#0A0A0A]">
          <Logo size={15} />

        </div>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block p-4 font-black uppercase text-sm tracking-wide brutalist-border transition-all rounded-2xl",
                pathname === item.href
                  ? "bg-[#1A73E8] text-white brutalist-shadow-sm"
                  : "bg-white hover:bg-[#4FC3F7] hover:translate-x-1"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default SideBar;
