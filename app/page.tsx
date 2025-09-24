import LaunchAppBtn from "@/components/miscellaneous/LaunchAppBtn";
import Logo from "@/components/miscellaneous/Logo";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full h-full repeated-square-bg-dark !p-8 flex flex-1 justify-center items-center flex-col gap-8 py-10 relative">
      <Logo />
      <div className="flex flex-col gap-8 items-center">
        <div className="flex flex-col gap-6 max-w-[600px]">
          <h1 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-black text-center">
            Lock your files in time. Verify them forever!
          </h1>
          <p className="text-center text-lg font-medium text-gray-600 ">
            ChronoVault lets you store critical files on an immutable Web3
            vault, time-lock their release and prove every hand-off with
            cryptographic receipts.
          </p>
        </div>
        <div className="w-fit max-w-full flex items-center justify-center">
          <LaunchAppBtn />
        </div>
      </div>
      <Image
        src={"/folder-image.svg"}
        alt=""
        width={180}
        height={180}
        className="absolute top-20 left-20  animate-updown"
      />
      <Image
        src={"/padlock.svg"}
        alt=""
        width={180}
        height={180}
        className="absolute bottom-20 right-20 animate-updown-delay "
      />
    </div>
  );
}
