"use client";
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
import ControlToolBar from "./GameToolBar";
import { FaFlag } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner";
import NewGameButton from "./NewGameButton";
import Chat from "./Chat";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";

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
  const router = useRouter();
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

  const [disconnected, setDisconnected] = useState(false);
  const disconnectedTimer = useTimer({ autoStart: false, initialSeconds: 30 });

  const [gameAborted, setGameAborted] = useState(false);
  const [rematcher, setRematcher] = useState<number | null>(null);

  const moveCallback = useCallback((pos: PawnPos, wall?: Wall) => {
    if (game.historyControl.activeMove == 0) abortTimer.restart(10, true);

    const res = game.gameControl.moveCallback(pos, wall);
    if (!res) return;

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
    console.log(gameData.players);
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
      setDisconnected(false);
    });

    gameSocket.on("abortGame", () => {
      if (game.gameControl.winner != null) return;
      setGameAborted(true);
      new Audio("/Notify.mp3").play();
      whiteTimer.pause();
      blackTimer.pause();
      abortTimer.pause();
      setDisconnected(false);
    });

    gameSocket.on("rematchGame", (gameId) => router.push(`/game/${gameId}`));

    gameSocket.on("rematch", (playerId: string) => {
      if (playerId == gameData.players[0]) {
        setRematcher(0);
      } else if (playerId == gameData.players[1]) {
        setRematcher(1);
      } else {
        setRematcher(null);
      }
      if (gameData.players[gameData.player == 0 ? 1 : 0] == playerId)
        new Audio("/Notify.mp3").play();
    });

    gameSocket.on("playerDisconnected", (playerId: string) => {
      if (game.gameControl.winner != null) return;
      if (
        (gameData.player == 1 && playerId == whitePlayerData.id) ||
        (gameData.player == 0 && playerId == blackPlayerData.id)
      ) {
        setDisconnected(true);
        disconnectedTimer.restart(250);
      }
    });

    gameSocket.on("playerConnected", (playerId: string) => {
      if (game.gameControl.winner != null) return;
      if (
        (gameData.player == 1 && playerId == whitePlayerData.id) ||
        (gameData.player == 0 && playerId == blackPlayerData.id)
      ) {
        setDisconnected(false);
        disconnectedTimer.pause();
      }
    });

    gameSocket.emit("ready");

    return () => {
      gameSocket.off("start");
      gameSocket.off("move");
      gameSocket.off("win");
      gameSocket.off("abortGame");
      gameSocket.off("rematchGame");
      gameSocket.off("rematch");
      gameSocket.disconnect();
    };
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
    if (game.gameControl.winner != null) return;
    gameSocket.emit("resign");
    new Audio("/Notify.mp3").play();
    whiteTimer.pause();
    blackTimer.pause();
    abortTimer.pause();
    setDisconnected(false);
  };

  const abort = () => gameSocket.emit("abort");

  const abortable =
    (gameData.player == 0 && game.historyControl.history.length == 0) ||
    (gameData.player == 1 && game.historyControl.history.length <= 1);

  const sendRematch = () => {
    gameSocket.emit("rematch");
  };

  const rejectRematch = () => {
    gameSocket.emit("rejectRematch");
    setRematcher(null);
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
          gameSocket={gameSocket}
          text={game.gameControl.winner.reason}
          time={60}
        />
      )}
      {gameAborted && <GameOverModal title={"Game Aborted"} />}
      <div className="grid grid-cols-10 place-items-center w-full max-w-7xl h-full gap-5">
        <div
          className={`flex ${
            game.boardSettings.reversed ? "flex-col-reverse" : "flex-col"
          } max-w-fit justify-center items-center w-full gap-3 col-span-10 lg:col-span-7`}
        >
          <GameUserData
            playerData={blackPlayerData}
            timer={blackTimer}
            wallsLeft={game.gameControl.blackWallsLeft}
            color="black"
            disconnected={gameData.player == 0 ? disconnected : false}
            disconnectedSeconds={disconnectedTimer.seconds}
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
            disconnected={gameData.player == 1 ? disconnected : false}
            disconnectedSeconds={disconnectedTimer.seconds}
          />
        </div>
        <div className="max-w-xl col-span-full lg:col-span-3 xl:col-span-3 w-full flex flex-col bg-stone-600 border-2 border-stone-800 rounded">
          <GameMenu
            historyControl={game.historyControl}
            className="border-b-2 border-stone-800"
          />
          {game.gameControl.winner != null &&
            rematcher == (gameData.player == 0 ? 1 : 0) && (
              <div className="flex flex-col items-center">
                <h1 className="text-sm font-bold text-stone-200 mt-2">
                  {gameData.player == 0
                    ? blackPlayerData.name
                    : whitePlayerData.name}{" "}
                  wants a rematch
                </h1>
                <RespondRematch
                  rejectRematch={rejectRematch}
                  sendRematch={sendRematch}
                />
              </div>
            )}
          {game.gameControl.winner != null &&
            rematcher != (gameData.player == 0 ? 1 : 0) && (
              <div className="flex flex-col items-center border-b-2 border-stone-800">
                {rematcher != null && (
                  <h1 className="text-sm font-bold text-stone-200 mt-2">
                    Rematch requested...
                  </h1>
                )}
                <div className="flex px-4 w-full py-2 h-12 items-center justify-center gap-3">
                  <NewGameButton
                    time={60}
                    className="max-w-[12rem] w-1/2 flex items-center justify-center  h-full font-bold text-stone-200 bg-stone-700 hover:bg-stone-500 active:focus:bg-stone-700 outline-none rounded-none"
                  />
                  <button
                    className="max-w-[12rem] px-4 w-1/2 h-full flex items-center justify-center font-bold text-stone-200 bg-stone-700 hover:bg-stone-500 active:focus:bg-stone-700 outline-none"
                    onClick={sendRematch}
                  >
                    {rematcher == null ? (
                      "Rematch"
                    ) : (
                      <Spinner className="border-white" />
                    )}
                  </button>
                </div>
              </div>
            )}

          <div className="flex flex-start">
            {abortable ? (
              <button
                className="flex items-center py-1 gap-2 px-4 font-bold text-stone-200 bg-stone-600 hover:bg-red-500 active:focus:bg-red-700 outline-none"
                onClick={abort}
              >
                <FaFlag className="text-xs" /> abort
              </button>
            ) : (
              <button
                className="flex items-center py-1 gap-2 px-4 font-bold text-stone-200 bg-stone-600 hover:bg-red-500 active:focus:bg-red-700 outline-none"
                onClick={resign}
              >
                <FaFlag className="text-xs" /> resign
              </button>
            )}
            <ControlToolBar
              goForward={game.historyControl.goForward}
              goBack={game.historyControl.goBack}
              activeMove={game.historyControl.activeMove}
              reverseBoard={game.gameControl.reverseBoard}
            />
          </div>
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
          <Chat
            className="border-t-2 border-stone-800"
            socket={gameSocket}
            whitePlayerData={whitePlayerData}
            blackPlayerData={blackPlayerData}
            player={gameData.player || 0}
          />
        </div>
      </div>
    </>
  );
}

const RespondRematch = ({
  rejectRematch,
  sendRematch,
}: {
  rejectRematch: () => void;
  sendRematch: () => void;
}) => {
  return (
    <div className="flex p-4 w-full items-center justify-center gap-3 border-b-2 border-stone-800 mx-4">
      <button
        className="max-w-[12rem] w-1/2 flex justify-center items-center py-1 gap-2 px-4 font-bold text-stone-200 bg-stone-700 hover:bg-stone-500 active:focus:bg-stone-800 outline-none"
        onClick={rejectRematch}
      >
        <IoMdClose className="text-xl" />
      </button>
      <button
        className="max-w-[12rem] w-1/2 flex justify-center items-center py-1 gap-2 px-4 font-bold text-stone-200 bg-stone-700 hover:bg-stone-500 active:focus:bg-stone-800 outline-none"
        onClick={sendRematch}
      >
        <IoMdCheckmark className="text-xl" />
      </button>
    </div>
  );
};
