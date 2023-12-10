"use client";
import { BoardLogic } from "@/components/BoardLogic";
import socket from "@/server";
import { useEffect, useState } from "react";

export default function Game() {
  const [player, setPlayer] = useState<number | null>(null);

  useEffect(() => {
    socket.on("start", (t: number) => {
      console.log("== Start", t, "==");
      setPlayer(t);
    });
    socket.emit("start");
    return () => {
      socket.off("start");
    };
  }, []);

  if (player == null) return <h1>Loading</h1>;

  return (
    <div>
      <BoardLogic player={player} />
    </div>
  );
}
