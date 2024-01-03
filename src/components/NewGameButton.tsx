"use client";

import socket from "@/server";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { twMerge } from "tailwind-merge";

const NewGameButton = ({
  time = 30,
  className,
}: {
  time?: number;
  className?: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on("foundGame", (gameId: number) => {
      router.push(`/game/${gameId}`);
    });
  }, []);

  const searchGame = () => {
    setLoading(true);
    if (loading) {
      socket.emit("cancelSearch", time);
      setLoading(false);
      return;
    }
    socket.emit("searchGame", time);
  };

  return (
    <button
      onClick={searchGame}
      className={twMerge("px-5 py-2 bg-green-500 rounded-md", className)}
    >
      {loading ? <Spinner className="border-white" /> : "Play Again"}
    </button>
  );
};

export default NewGameButton;
