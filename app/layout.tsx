import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSans = DM_Sans({
   subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
  style: ["normal", "italic"],
  variable: "--font-dmsans",
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
      <body className={`${dmSans.variable} !font-dmsans antialiased`}>
        <Providers>
          <main className="w-screen h-screen p-4 bg-black flex flex-col items-center justify-center">
            <div className="w-full max-h-full h-full flex-1 bg-white text-black rounded-2xl overflow-y-auto overflow-x-hidden repeated-square-bg-dark">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
