import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: [
    "300",
    "400",
    "500",
    "600",
    "700",
  ],
  style: ["normal"],
  variable: "--font-space_grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChronoVault",
  description: "A vault system for time-locked assets on Sui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${space_grotesk.variable} !font-space_grotesk antialiased`}>
        <Providers>
          <main className="w-screen h-screen p-4 bg-[#1A73E8] flex flex-col items-center justify-center">
            <div className="w-full max-h-full h-full flex-1 bg-white text-black border-4 border-black overflow-y-auto overflow-x-hidden repeated-square-bg-dark rounded-2xl">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
