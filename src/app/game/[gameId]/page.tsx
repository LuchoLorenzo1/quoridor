"use client";
import Board, { PawnPos, Wall } from "@/components/Board";
import GameMenu from "@/components/GameMenu";
import GameOverModal from "@/components/GameOverModal";
import useGame from "@/hooks/useGame";
import { moveToString, stringToMove } from "@/utils";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const gameSocket = io("http://localhost:8000/game", {
  withCredentials: true,
  autoConnect: true,
});

export default function Game() {
  const [player, setPlayer] = useState<number | null>(null);
  const game = useGame(player, false);

  const moveCallback = (pos: PawnPos, wall?: Wall) => {
    if (wall) {
      game.gameControl.moveWall(pos, wall);
    } else {
      game.gameControl.movePawn(pos);
    }
    gameSocket.emit("move", moveToString(pos, wall));
  };

  useEffect(() => {
    gameSocket.on("start", (history: string[], t: number, p: number) => {
      setPlayer(p);
      game.gameControl.setTurn(t);
      game.historyControl.setHistory(history);
      game.historyControl.goForward(Infinity);
      if (p == 1) game.gameControl.reverseBoard();
    });

    if (gameSocket.connected) {
      gameSocket.emit("start");
    } else {
      gameSocket.connect();
      gameSocket.once("connect", () => {
        gameSocket.emit("start");
      });
    }

    gameSocket.on("move", (move: string) => {
      game.historyControl.goForward(Infinity);

      const { pos, wall } = stringToMove(move);

      if (wall) {
        game.gameControl.moveWall(pos, wall);
      } else {
        game.gameControl.movePawn(pos);
      }
    });

    gameSocket.on("win", (winner: number, reason?: string) => {
      game.gameControl.setWinner({ winner, reason });
    });

    return () => {
      gameSocket.off("start");
      gameSocket.off("move");
      gameSocket.off("win");
      gameSocket.disconnect();
    };
  }, []);

  if (player == null) return <h1>Loading</h1>;

  return (
    <div className="flex justify-center items-center gap-5 h-full w-full">
      {game.gameControl.winner != null && (
        <GameOverModal
          win={game.gameControl.winner.winner == player}
          text={game.gameControl.winner.reason}
        />
      )}
      <div className="flex flex-col justify-center items-center gap-5">
        {game.boardSettings.reversed ? (
          <h1>White walls left: {game.gameControl.whiteWallsLeft}</h1>
        ) : (
          <h1>Black walls left: {game.gameControl.blackWallsLeft}</h1>
        )}
        <Board
          boardState={game.boardState}
          boardSettings={game.boardSettings}
          moveCallback={moveCallback}
        />
        {game.boardSettings.reversed ? (
          <h1>Black walls left: {game.gameControl.blackWallsLeft}</h1>
        ) : (
          <h1>White walls left: {game.gameControl.whiteWallsLeft}</h1>
        )}
      </div>
      <div className="flex flex-col gap-5 h-3/4 justify-center items-center">
        <GameMenu historyControl={game.historyControl} />
        <button
          className="w-3/4 rounded px-4 py-2 bg-blue-400 hover:bg-blue-500"
          onClick={game.gameControl.reverseBoard}
        >
          Flip Board
        </button>
        <button
          className="w-3/4 rounded px-4 py-2 bg-red-200 hover:bg-red-500"
          onClick={() => gameSocket.emit("resign")}
        >
          Resign
        </button>
        <h1>You are playing as: {player == 0 ? "White" : "Black"}</h1>
        <h1>Turn: {game.boardState.turn == 0 ? "White" : "Black"}</h1>
      </div>
    </div>
  );
}
