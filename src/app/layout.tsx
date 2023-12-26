import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/context/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "quoridor",
  description: "a simple and fun game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-green-500">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
