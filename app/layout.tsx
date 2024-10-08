import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameStateProvider } from "./game-state-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solitaire",
  description: "Play Solitaire in your browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative bg-gray-800`}>
        <GameStateProvider>{children}</GameStateProvider>
      </body>
    </html>
  );
}
