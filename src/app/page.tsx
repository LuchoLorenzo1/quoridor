"use client";
import socket from "@/server";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    socket.on("found-game", (gameId: number) => {
      router.push(`/game/${gameId}`);
    });
  }, []);

  const searchGame = () => {
    socket.emit("search-game");
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <button
        className="px-4 py-2 bg-green-500 text-white hover:bg-green-400 shadow-black"
        onClick={searchGame}
      >
        PLAY
      </button>
    </div>
  );
}
