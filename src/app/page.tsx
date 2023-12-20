"use client";
import Spinner from "@/components/Spinner";
import socket from "@/server";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const session = useSession({ required: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on("found-game", (gameId: number) => router.push(`/game/${gameId}`));
    return () => {
      socket.off("found-game");
    };
  }, []);

  const searchGame = () => {
    setLoading(true);
    socket.emit("search-game");
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-5">
      <h1 className="text-4xl">Quoridor</h1>
      <div className="h-12 flex gap-5">
        {session.status == "authenticated" && (
          <button
            className="h-full px-4 py-2 bg-green-500 text-white hover:bg-green-400 shadow-black"
            disabled={loading}
            onClick={searchGame}
          >
            {loading ? (
              <Spinner className="border-white w-4 h-4" />
            ) : (
              "PLAY ONLINE"
            )}
          </button>
        )}
        <button
          className="h-full px-4 py-2 bg-green-500 text-white hover:bg-green-400 shadow-black"
          onClick={() => router.push("/offline")}
        >
          PLAY OFFLINE
        </button>
      </div>
    </div>
  );
}
