"use client";
import Spinner from "@/components/Spinner";
import socket from "@/server";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export default function Home() {
  const router = useRouter();
  const { status } = useSession({ required: false });
  const [reconnectGameId, setReconnectGameId] = useState("");
  const [searching, setSearching] = useState<number | null>(null);

  useEffect(() => {
    if (status != "authenticated") return;
    socket.connect();

    if (socket.connected) {
      socket.emit("reconnectGame");
    } else {
      socket.once("connect", () => {
        socket.emit("reconnectGame");
      });
    }

    socket.on("reconnectGame", (gameId: string) => setReconnectGameId(gameId));
    socket.on("foundGame", (gameId: string) => router.push(`/game/${gameId}`));
    return () => {
      socket.off("foundGame");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const ButtonGame = ({
    seconds,
    text = "1 minute",
  }: {
    seconds: number;
    text?: string;
  }) => {
    const searchGame = (seconds: number) => {
      if (searching == seconds) {
        socket.emit("cancelSearchGame", seconds);
        setSearching(null);
        return;
      }
      setSearching(seconds);
      socket.emit("searchGame", seconds);
    };

    return (
      <button
        className={twMerge(
          "text-xl w-auto min-h-[5rem] h-full bg-stone-600 text-white hover:bg-stone-200 hover:text-stone-600 transition-all duration-75 shadow shadow-stone-200",
          searching == seconds ? "bg-stone-200" : "",
        )}
        onClick={() => searchGame(seconds)}
      >
        {searching == seconds ? (
          <Spinner className="transition-all border-stone-600" />
        ) : (
          text
        )}
      </button>
    );
  };

  return (
    <div className="h-full w-full max-w-5xl flex flex-col items-center justify-center gap-5">
      <h1 className="text-4xl font-bold">Play Quoridor</h1>
      <div className="max-w-xl w-full grid grid-cols-3 gap-3">
        <ButtonGame seconds={30} text={"30 seconds"} />
        <ButtonGame seconds={60} text={"1 minutes"} />
        <ButtonGame seconds={120} text={"2 minutes"} />
        <ButtonGame seconds={180} text={"3 minutes"} />
        <ButtonGame seconds={240} text={"4 minutes"} />
        <ButtonGame seconds={300} text={"5 minutes"} />
      </div>
      {reconnectGameId && (
        <button
          className="font-bold h-full px-4 py-2 bg-orange-500 text-white hover:bg-orange-400 shadow-black"
          onClick={() => router.push(`game/${reconnectGameId}`)}
        >
          Reconnect To Game
        </button>
      )}
    </div>
  );
}
