import React from "react";
import { GrSecure } from "react-icons/gr";

function Logo({ size }: { size?: number }) {
  return (
    <div
      style={{ fontSize: `${size}px` }}
      className="text-xl font-black w-fit text-center flex items-center gap-3 justify-center m-auto brutalist-border brutalist-shadow-sm bg-[#F5F5F5] pr-6 uppercase tracking-wider overflow-hidden"
    >
      <span className="p-3 bg-[#1A73E8] text-white">
        <GrSecure size={size ?? 20} />
      </span>
      ChronoVault
    </div>
  );
}

export default Logo;
