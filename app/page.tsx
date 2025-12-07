"use client";

import { motion } from "framer-motion";
import LaunchAppBtn from "@/components/miscellaneous/LaunchAppBtn";
import Logo from "@/components/miscellaneous/Logo";
import ScrollingText from "@/components/landing/ScrollingText";

export default function Home() {
  // Simplified animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="w-full h-full !p-8 flex flex-1 justify-center items-center flex-col gap-6 py-10 relative overflow-hidden">
      {/* Diagonal scrolling text bars */}
      <ScrollingText />

      {/* Main content */}
      <motion.div
        className="flex flex-col gap-8 items-center z-10 max-w-[900px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Logo />
        </motion.div>

        <motion.div
          className="flex flex-col gap-6 w-full"
          variants={itemVariants}
        >
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-center text-[#0A0A0A] leading-tight uppercase">
            Lock your files in time. Verify them forever!
          </h1>

          <p className="text-center text-lg md:text-xl lg:text-2xl font-bold text-gray-800 leading-relaxed">
            ChronoVault lets you store critical files on an immutable Web3
            vault, time-lock their release and prove every hand-off with
            cryptographic receipts.
          </p>
        </motion.div>

        <motion.div
          className="w-fit max-w-full flex items-center justify-center mt-4"
          variants={itemVariants}
        >
          <LaunchAppBtn />
        </motion.div>
      </motion.div>
    </div>
  );
}

