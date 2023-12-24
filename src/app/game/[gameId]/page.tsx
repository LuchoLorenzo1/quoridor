"use client";
import Board, { PawnPos, Wall } from "@/components/Board";
import GameMenu from "@/components/GameMenu";
import GameOverModal from "@/components/GameOverModal";
import useGame from "@/hooks/useGame";
import useTimer from "@/hooks/useTimer";
import { moveToString, stringToMove } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const gameSocket = io("http://localhost:8000/game", {
  withCredentials: true,
  autoConnect: true,
});

export default function OnlineGame() {
  const [player, setPlayer] = useState<number | null>(null);
  const playerRef = useRef<number | null>(null);

  const game = useGame(player, false);
  const whiteTimer = useTimer({ initialSeconds: 600, autoStart: false });
  const blackTimer = useTimer({ initialSeconds: 600, autoStart: false });

  const moveCallback = (pos: PawnPos, wall?: Wall) => {
    game.gameControl.moveCallback(pos, wall);
    gameSocket.emit("move", moveToString(pos, wall), (timeLeft: number) => {
      if (playerRef.current == 0) {
        whiteTimer.restart(timeLeft * 10, false);
        blackTimer.resume();
      } else {
        blackTimer.restart(timeLeft * 10, false);
        whiteTimer.resume();
      }
      console.log(timeLeft);
    });
  };

  useEffect(() => {
    gameSocket.on(
      "gameState",
      (history: string[], t: number, p: number, seconds: number) => {
        setPlayer(p);
        playerRef.current = p;
        game.gameControl.setTurn(t);
        game.historyControl.setHistory(history);
        game.historyControl.goForward(Infinity);

        whiteTimer.restart(seconds * 10, false);
        blackTimer.restart(seconds * 10, false);

        if (p == 1) game.gameControl.reverseBoard();
      },
    );

    gameSocket.on("start", () => {
      whiteTimer.resume();
    });

    gameSocket.on("move", (move: string, timeLeft: number) => {
      game.historyControl.goForward(Infinity);
      const { pos, wall } = stringToMove(move);

      if (playerRef.current == 0) {
        blackTimer.restart(timeLeft * 10, false);
        whiteTimer.resume();
      } else {
        whiteTimer.restart(timeLeft * 10, false);
        blackTimer.resume();
      }

      game.gameControl.moveCallback(pos, wall);
    });

    gameSocket.on("win", (winner: number, reason?: string) => {
      game.gameControl.setWinner({ winner, reason });
    });

    if (gameSocket.connected) {
      gameSocket.emit("ready");
    } else {
      gameSocket.connect();
      gameSocket.once("connect", () => {
        gameSocket.emit("ready");
      });
    }

    return () => {
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
      <div
        className={`flex ${
          game.boardSettings.reversed ? "flex-col-reverse" : "flex-col"
        } justify-center items-center gap-5`}
      >
        <h1>Black walls left: {game.gameControl.blackWallsLeft}</h1>
        <div>
          <span>{blackTimer.minutes}</span>:
          <span>
            {(blackTimer.seconds.toString().length == 1 ? "0" : "") +
              blackTimer.seconds.toString()}
          </span>
          .<span>{blackTimer.tenths.toString()}</span>
        </div>
        <Board
          boardState={game.boardState}
          boardSettings={game.boardSettings}
          moveCallback={moveCallback}
        />
        <h1>White walls left: {game.gameControl.whiteWallsLeft}</h1>
        <div>
          <span>{whiteTimer.minutes}</span>:
          <span>
            {(whiteTimer.seconds.toString().length == 1 ? "0" : "") +
              whiteTimer.seconds.toString()}
          </span>
          .<span>{whiteTimer.tenths.toString()}</span>
        </div>
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
