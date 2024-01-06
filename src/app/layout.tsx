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
  signInModal,
}: {
  children: React.ReactNode;
  signInModal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} w-full h-full flex flex-col items-center`}
      >
        <Providers>
          <Navbar />
          {children}
          {signInModal}
        </Providers>
      </body>
    </html>
  );
}
