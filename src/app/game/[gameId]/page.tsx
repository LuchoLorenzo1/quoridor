"use client";
import { Pawn, PawnPos, Wall } from "@/components/Board";
import { BoardLogic } from "@/components/BoardLogic";
import GameOverModal from "@/components/GameOverModal";
import useGame from "@/hooks/useGame";
import socket from "@/server";
import { moveToString, stringToMove } from "@/utils";
import { useEffect, useState } from "react";

export default function Game() {
  const [player, setPlayer] = useState<number | null>(null);
  const game = useGame(player);

  const moveCallback = (pos: PawnPos, wall?: Wall) => {
    if (wall) {
      game.gameControl.moveWall(pos, wall);
    } else {
      game.gameControl.movePawn(pos);
    }
    socket.emit("move", moveToString(pos, wall));
  };

  useEffect(() => {
    socket.on("start", (t: number) => {
      console.log("== Start", t, "==");
      setPlayer(t);
    });

    socket.emit("start");

    socket.on("move", (move: string) => {
      game.historyControl.goForward(Infinity);

      const { pos, wall } = stringToMove(move);

      if (wall) {
        game.gameControl.moveWall(pos, wall);
      } else {
        game.gameControl.movePawn(pos);
      }
    });

    return () => {
      socket.off("start");
      socket.off("move");
    };
  }, []);

  if (player == null) return <h1>Loading</h1>;

  return (
    <>
      {game.gameControl.winner != null && (
        <GameOverModal win={game.gameControl.winner == player} />
      )}
      <BoardLogic player={player} game={game} moveCallback={moveCallback} />
    </>
  );
}
