"use client";
import Spinner from "@/components/Spinner";
import socket from "@/server";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { status } = useSession({ required: false });
  const [loading, setLoading] = useState(false);
  const [reconnectGameId, setReconnectGameId] = useState("");

  useEffect(() => {
    if (status != "authenticated") return;
    socket.connect();

    if (socket.connected) {
	  socket.emit("reconnectGame")
    } else {
      socket.once("connect", () => {
		socket.emit("reconnectGame")
      });
    }

    socket.on("reconnectGame", (gameId: string) => setReconnectGameId(gameId));
    socket.on("foundGame", (gameId: string) => router.push(`/game/${gameId}`));
    return () => {
      socket.off("foundGame");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const searchGame = () => {
    setLoading(true);
    socket.emit("searchGame");
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-5">
      <h1 className="text-4xl">Quoridor</h1>
	  <div className="flex flex-col items-center gap-5">
      <div className="h-12 flex gap-5">
        {status == "authenticated" && (
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
	  { reconnectGameId &&
       <button
          className="font-bold h-full px-4 py-2 bg-orange-500 text-white hover:bg-orange-400 shadow-black"
          onClick={() => router.push(`game/${reconnectGameId}`)}
        >
          Reconnect To Game
        </button>
	  }
      </div>
    </div>
  );
}
