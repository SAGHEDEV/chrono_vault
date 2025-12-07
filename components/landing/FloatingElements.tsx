"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function FloatingElements() {
    return (
        <>
            {/* Top-left floating card */}
            <motion.div
                className="absolute top-16 left-16 brutalist-card p-6 bg-[#E3F2FD] hidden lg:block"
                initial={{ opacity: 0, y: -50, rotate: -5 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    rotate: -5,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.3,
                }}
                whileHover={{
                    scale: 1.05,
                    rotate: -8,
                    transition: { duration: 0.2 }
                }}
            >
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Image
                        src={"/folder-image.svg"}
                        alt="Folder icon"
                        width={140}
                        height={140}
                    />
                </motion.div>
            </motion.div>

            {/* Bottom-right floating card */}
            <motion.div
                className="absolute bottom-16 right-16 brutalist-card p-6 bg-[#4FC3F7] hidden lg:block"
                initial={{ opacity: 0, y: 50, rotate: 5 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    rotate: 5,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.5,
                }}
                whileHover={{
                    scale: 1.05,
                    rotate: 8,
                    transition: { duration: 0.2 }
                }}
            >
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                    }}
                >
                    <Image
                        src={"/padlock.svg"}
                        alt="Padlock icon"
                        width={140}
                        height={140}
                    />
                </motion.div>
            </motion.div>

            {/* Top-right floating card */}
            <motion.div
                className="absolute top-32 right-32 brutalist-card p-4 bg-[#1A73E8] hidden xl:block"
                initial={{ opacity: 0, scale: 0, rotate: 10 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 10,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.7,
                }}
                whileHover={{
                    scale: 1.1,
                    rotate: 15,
                    transition: { duration: 0.2 }
                }}
            >
                <motion.div
                    className="text-white font-black text-2xl"
                    animate={{
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    🔒
                </motion.div>
            </motion.div>

            {/* Bottom-left floating card */}
            <motion.div
                className="absolute bottom-32 left-32 brutalist-card p-4 bg-[#0B2A4A] hidden xl:block"
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: -10,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.9,
                }}
                whileHover={{
                    scale: 1.1,
                    rotate: -15,
                    transition: { duration: 0.2 }
                }}
            >
                <motion.div
                    className="text-white font-black text-2xl"
                    animate={{
                        rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                >
                    ⏰
                </motion.div>
            </motion.div>
        </>
    );
}
