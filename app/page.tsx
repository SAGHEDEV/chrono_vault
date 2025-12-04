import LaunchAppBtn from "@/components/miscellaneous/LaunchAppBtn";
import Logo from "@/components/miscellaneous/Logo";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full h-full  !p-8 flex flex-1 justify-center items-center flex-col gap-6 py-10 relative overflow-hidden">
      <div className="flex flex-col gap-6 items-center z-10">
        <Logo />
        <div className="flex flex-col gap-6 max-w-[800px] mt-6">
          <h1 className="text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-black text-center text-[#0A0A0A] leading-tight uppercase">
            Lock your files in time. Verify them forever!
          </h1>
          <p className="text-center text-lg md:text-2xl font-bold text-gray-800 leading-relaxed">
            ChronoVault lets you store critical files on an immutable Web3
            vault, time-lock their release and prove every hand-off with
            cryptographic receipts.
          </p>
        </div>
        <div className="w-fit max-w-full flex items-center justify-center">
          <LaunchAppBtn />
        </div>
      </div>

      {/* Decorative elements with brutalist cards */}
      {/* <div className="absolute top-16 left-16 brutalist-card p-6 bg-[#E3F2FD] rotate-[-5deg] hidden lg:block">
        <Image
          src={"/folder-image.svg"}
          alt=""
          width={140}
          height={140}
        />
      </div>
      <div className="absolute bottom-16 right-16 brutalist-card p-6 bg-[#4FC3F7] rotate-[5deg] hidden lg:block">
        <Image
          src={"/padlock.svg"}
          alt=""
          width={140}
          height={140}
        />
      </div> */}
    </div>
  );
}

