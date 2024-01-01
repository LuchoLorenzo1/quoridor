"use client";
import Spinner from "@/components/Spinner";
import socket from "@/server";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ImTrophy } from "react-icons/im";
import { FaMedal } from "react-icons/fa";

interface Stats {
  playing: string;
  online: string;
}

export default function Home() {
  const router = useRouter();
  const { status } = useSession({ required: false });
  const [reconnectGameId, setReconnectGameId] = useState("");
  const [searching, setSearching] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status != "authenticated") return;

    if (socket.connected) {
      socket.emit("home");
    } else {
      socket.once("connect", () => {
        socket.emit("home");
      });
    }

    socket.on("reconnectGame", (gameId: string) => setReconnectGameId(gameId));
    socket.on("foundGame", (gameId: string) => router.push(`/game/${gameId}`));
    socket.on("stats", (stats: Stats) => setStats(stats));

    return () => {
      socket.off("reconnectGame");
      socket.off("stats");
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
          "w-auto min-h-[5rem] h-full rounded bg-stone-600 text-xl text-stone-200 hover:bg-stone-200 hover:text-stone-600 transition-all duration-75 shadow shadow-stone-200",
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
    <div className="grid grid-cols-10 place-items-center gap-3 h-full w-full max-w-3xl">
      <div className="col-span-10 md:col-span-8 flex flex-col items-center max-w-xl w-full">
        <h1 className="text-stone-700 text-4xl font-bold mb-3">
          Play Quoridor
        </h1>
        <div className="w-full grid grid-cols-3 gap-3">
          <ButtonGame seconds={30} text={"30 seconds"} />
          <ButtonGame seconds={60} text={"1 minutes"} />
          <ButtonGame seconds={120} text={"2 minutes"} />
          <ButtonGame seconds={180} text={"3 minutes"} />
          <ButtonGame seconds={240} text={"4 minutes"} />
          <ButtonGame seconds={300} text={"5 minutes"} />
        </div>
        {stats && (
          <ul className="select-none w-full h-full py-2 text-stone-800 text-sm flex gap-3">
            <li className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 hover:bg-green-600" />
              <h1>{stats.online} users online</h1>
            </li>
            <li className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500 hover:bg-orange-600" />
              <h1>{stats.playing} users playing</h1>
            </li>
          </ul>
        )}
        {reconnectGameId && (
          <button
            className="font-bold w-52 h-full rounded px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 shadow-black"
            onClick={() => router.push(`game/${reconnectGameId}`)}
          >
            Reconnect To Game
          </button>
        )}
      </div>
      <ul className="text-xl flex flex-col rounded px-3 py-4 bg-stone-200 col-span-10 place-items-center md:col-span-2 gap-3 justify-center text-stone-800 shadow shadow-stone-800">
        <li className="flex items-center gap-1">
          <h1>ELO 1238</h1>
          <ImTrophy />
        </li>
        <li className="flex items-center gap-1">
          <h1>WINS 213</h1>
          <FaMedal />
        </li>
      </ul>
    </div>
  );
}
