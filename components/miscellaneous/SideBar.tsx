import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import Logo from "./Logo";

function SideBar() {
  const pathname = usePathname();
  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Valults", href: "/vaults" },
    { name: "Create Vault", href: "/upload" },
  ];
  return (
    <div className="w-full max-w-[240px] bg-white border border-border shadow-lg rounded-xl p-4 py-6">
      <div className="flex flex-col gap-7">
        <div className="pb-5 border-b border-border">
        <Logo size={15} />

        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block p-3 font-medium rounded-lg transition active:scale-95",
                pathname === item.href
                  ? "bg-black text-white hover:bg-gray-700"
                  : "hover:bg-gray-100"
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
