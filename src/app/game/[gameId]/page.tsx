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
  const abortTimer = useTimer({
    initialSeconds: 10,
    autoStart: false,
    delay: 1000,
  });
  const [gameAborted, setGameAborted] = useState(false);

  const moveCallback = (pos: PawnPos, wall?: Wall) => {
    if (game.historyControl.activeMove == 0) abortTimer.restart(10, true);

    game.gameControl.moveCallback(pos, wall);
    gameSocket.emit("move", moveToString(pos, wall), (timeLeft: number) => {
      if (playerRef.current == 0) {
        whiteTimer.restart(timeLeft * 10, false);
        blackTimer.resume();
      } else {
        blackTimer.restart(timeLeft * 10, false);
        whiteTimer.resume();
      }
    });
  };

  useEffect(() => {
    gameSocket.on(
      "gameState",
      (
        history: string[],
        t: number,
        p: number,
        whiteTimeLeft: number,
        blackTimeLeft: number,
      ) => {
        setPlayer(p);
        playerRef.current = p;
        game.gameControl.setTurn(t == -1 ? 0 : t);
        game.historyControl.setHistory(history);
        game.historyControl.goForward(Infinity);

        whiteTimer.restart(whiteTimeLeft * 10, history.length > 0 && t == 0);
        blackTimer.restart(blackTimeLeft * 10, t == 1);

        if (history.length > 1 && t != -1) {
          abortTimer.pause();
        }

        if (p == 1) game.gameControl.reverseBoard();
      },
    );

    gameSocket.on("start", () => {
      abortTimer.restart(10, true);
    });

    let moves = 0;
    gameSocket.on("move", (move: string, timeLeft: number) => {
      game.historyControl.goForward(Infinity);
      if (moves == 0) {
        abortTimer.restart(10, true);
      } else {
        moves++;
      }

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
      whiteTimer.pause();
      blackTimer.pause();
      abortTimer.pause();
    });

    gameSocket.on("abortGame", () => {
      setGameAborted(true);
      whiteTimer.pause();
      blackTimer.pause();
      abortTimer.pause();
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

  const resign = () => {
    gameSocket.emit("resign");
    whiteTimer.pause();
    blackTimer.pause();
    abortTimer.pause();
    setGameAborted(true);
  };

  if (player == null) return <h1>Loading</h1>;

  return (
    <div className="flex justify-center items-center gap-5 h-full w-full">
      {game.gameControl.winner != null && (
        <GameOverModal
          title={
            game.gameControl.winner.winner == player ? "You won!" : "You lost!"
          }
          text={game.gameControl.winner.reason}
        />
      )}
      {gameAborted && <GameOverModal title={"Game Aborted"} />}
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
        <h1>
          {!gameAborted &&
          game.historyControl.activeMove == 1 &&
          abortTimer.totalSeconds < 6
            ? `aborting in ${abortTimer.totalSeconds}...`
            : ""}
        </h1>
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
        <h1>
          {!gameAborted &&
          game.historyControl.activeMove == 0 &&
          abortTimer.totalSeconds < 6
            ? `aborting in ${abortTimer.totalSeconds}...`
            : ""}
        </h1>
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
          onClick={resign}
        >
          Resign
        </button>
        <h1>You are playing as: {player == 0 ? "White" : "Black"}</h1>
        <h1>Turn: {game.boardState.turn == 0 ? "White" : "Black"}</h1>
      </div>
    </div>
  );
}
