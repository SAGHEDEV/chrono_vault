"use client";

import { motion } from "framer-motion";

export default function ScrollingText() {
    const text = "SECURED • TIMELESS • DECENTRALIZED • ";
    const repeatedText = text.repeat(10);

    return (
        <>
            {/* Diagonal bar - top-left to bottom-right */}
            <div
                className="fixed pointer-events-none overflow-hidden z-0"
                style={{
                    width: "200%",
                    height: "80px",
                    bottom: "40px",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(10deg)",
                    transformOrigin: "center",
                }}
            >
                <div className="w-full h-full bg-[#FFD93D] border-y-4 border-black flex items-center overflow-hidden">
                    <motion.div
                        className="whitespace-nowrap text-black font-black text-xl md:text-2xl uppercase flex-shrink-0"
                        animate={{ x: [0, -1000] }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        {repeatedText}
                    </motion.div>
                </div>
            </div>

            {/* Diagonal bar - top-right to bottom-left */}
            <div
                className="fixed pointer-events-none overflow-hidden z-0"
                style={{
                    width: "200%",
                    height: "80px",
                    bottom: "40px",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(-10deg)",
                    transformOrigin: "center",
                }}
            >
                <div className="w-full h-full bg-[#FFD93D] border-y-4 border-black flex items-center overflow-hidden">
                    <motion.div
                        className="whitespace-nowrap text-black font-black text-xl md:text-2xl uppercase flex-shrink-0"
                        animate={{ x: [-1000, 0] }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        {repeatedText}
                    </motion.div>
                </div>
            </div>
        </>
    );
}
