/* eslint-disable react-hooks/exhaustive-deps */
import { GameData, UserData } from "@/app/game/[gameId]/page";
import useGame from "@/hooks/useGame";
import useTimer from "@/hooks/useTimer";
import { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Board, { PawnPos, Wall } from "./Board";
import { moveToString, stringToMove } from "@/utils";
import GameOverModal from "./GameOverModal";
import GameMenu from "./GameMenu";
import GameUserData from "./GameUserData";

export default function OnlineGame({
  gameSocket,
  gameData,
  whitePlayerData,
  blackPlayerData,
}: {
  gameSocket: Socket;
  gameData: GameData;
  whitePlayerData: UserData;
  blackPlayerData: UserData;
}) {
  const game = useGame({
    player: gameData.player,
    initialHistory: gameData.history,
    initialTurn: gameData.turn,
    defineWinner: false,
  });
  const whiteTimer = useTimer({
    initialSeconds: gameData.whiteTimeLeft * 10,
    autoStart: gameData.history.length > 0 && gameData.turn == 0,
  });
  const blackTimer = useTimer({
    initialSeconds: gameData.blackTimeLeft * 10,
    autoStart: gameData.turn == 1,
  });
  const abortTimer = useTimer({
    initialSeconds: 10,
    autoStart: false,
    delay: 1000,
  });

  const [gameAborted, setGameAborted] = useState(false);

  const moveCallback = useCallback((pos: PawnPos, wall?: Wall) => {
    if (game.historyControl.activeMove == 0) abortTimer.restart(10, true);

    game.gameControl.moveCallback(pos, wall);
    gameSocket.emit("move", moveToString(pos, wall), (timeLeft: number) => {
      if (gameData.player == 0) {
        whiteTimer.restart(timeLeft * 10, false);
        blackTimer.resume();
      } else {
        blackTimer.restart(timeLeft * 10, false);
        whiteTimer.resume();
      }
    });
  }, []);

  useEffect(() => {
    game.gameControl.setTurn(gameData.turn == -1 ? 0 : gameData.turn);
    game.historyControl.setHistory(gameData.history);
    game.historyControl.goForward(Infinity);

    if (gameData.history.length > 1 && gameData.turn != -1) {
      abortTimer.pause();
    }

    if (gameData.player == 1) game.gameControl.reverseBoard();

    gameSocket.on("start", () => {
      new Audio("/Notify.mp3").play();
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

      if (gameData.player == 0) {
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
      new Audio("/Notify.mp3").play();

      whiteTimer.pause();
      blackTimer.pause();
      abortTimer.pause();
    });

    gameSocket.on("abortGame", () => {
      setGameAborted(true);
      new Audio("/Notify.mp3").play();
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
  }, []);

  const checkLowTime =
    gameData.player == 0 ? whiteTimer.lowTime : blackTimer.lowTime;
  useEffect(() => {
    let sound = new Audio("/LowTime.mp3");
    if (gameData.player == 0 && whiteTimer.lowTime) {
      sound.play();
    } else if (gameData.player == 1 && blackTimer.lowTime) {
      sound.play();
    }
  }, [checkLowTime]);

  const resign = () => {
    gameSocket.emit("resign");
    new Audio("/Notify.mp3").play();
    whiteTimer.pause();
    blackTimer.pause();
    abortTimer.pause();
  };

  return (
    <>
      {game.gameControl.winner != null && (
        <GameOverModal
          title={
            game.gameControl.winner.winner == gameData.player
              ? "You won!"
              : "You lost!"
          }
          text={game.gameControl.winner.reason}
        />
      )}
      {gameAborted && <GameOverModal title={"Game Aborted"} />}

      <div className="grid grid-cols-10 gap-10 place-items-center w-full max-w-7xl h-full">
        <div
          className={`flex ${
            game.boardSettings.reversed ? "flex-col-reverse" : "flex-col"
          } max-w-fit justify-center items-center w-full gap-3 col-span-10 lg:col-span-8 xl:col-span-7`}
        >
          <GameUserData
            playerData={blackPlayerData}
            timer={blackTimer}
            wallsLeft={game.gameControl.blackWallsLeft}
            color="black"
          />
          <Board
            boardState={game.boardState}
            boardSettings={game.boardSettings}
            moveCallback={moveCallback}
          />
          <GameUserData
            playerData={whitePlayerData}
            timer={whiteTimer}
            wallsLeft={game.gameControl.whiteWallsLeft}
          />
        </div>
        <div className="col-span-full col-start-3 col-end-9 lg:col-span-2 xl:col-span-3 flex flex-col gap-5 w-full h-full items-center">
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
          <h1>
            {!gameAborted &&
            game.historyControl.history.length == 1 &&
            abortTimer.totalSeconds < 6
              ? `aborting in ${abortTimer.totalSeconds}...`
              : ""}
          </h1>
          <h1>
            {!gameAborted &&
            game.historyControl.history.length == 0 &&
            abortTimer.totalSeconds < 6
              ? `aborting in ${abortTimer.totalSeconds}...`
              : ""}
          </h1>
        </div>
      </div>
    </>
  );
}
