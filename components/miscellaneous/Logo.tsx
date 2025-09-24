import React from "react";
import { GrSecure } from "react-icons/gr";

function Logo({size}:{size?:number}) {
  return (
    <div style={{fontSize: `${size}px`}} className="text-xl font-extrabold w-fit text-center flex items-center gap-2 justify-center m-auto border border-black rounded-full pr-6">
      <span className="p-2 rounded-full bg-black text-white">
        <GrSecure size={size ?? 20} />
      </span>
      ChronoVault
    </div>
  );
}

export default Logo;
