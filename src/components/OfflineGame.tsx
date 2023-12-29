"use client";
import Board from "@/components/Board";
import GameMenu from "@/components/GameMenu";
import useGame from "@/hooks/useGame";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import GameUserData from "./GameUserData";
import { UserData } from "@/app/game/[gameId]/page";

export default function OfflineGame({
  blackPlayerData,
  whitePlayerData,
  wallsLeft,
  initialHistory,
  initialTurn,
  winner,
  winningReason,
}: {
  blackPlayerData: UserData;
  whitePlayerData: UserData;
  wallsLeft?: { white: number; black: number };
  initialHistory?: string[];
  initialTurn?: number;
  winner?: number;
  winningReason?: string;
}) {
  const game = useGame(null, wallsLeft, initialHistory, initialTurn);

  useEffect(() => {
    if (winner == 0 || winner == 1) {
      game.gameControl.setWinner({ winner, reason: winningReason });
      new Audio("/Notify.mp3").play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {game.gameControl.winner != null && (
        <GameOverModalOffline
          winner={game.gameControl.winner.winner}
          restart={game.gameControl.restart}
          text={game.gameControl.winner.reason}
        />
      )}
      <div className="grid grid-cols-10 gap-10 place-items-center w-full max-w-7xl h-full">
        <div
          className={`flex ${
            game.boardSettings.reversed ? "flex-col-reverse" : "flex-col"
          } max-w-fit justify-center items-center w-full gap-3 col-span-10 lg:col-span-8 xl:col-span-7`}
        >
          <GameUserData
            playerData={blackPlayerData}
            wallsLeft={game.gameControl.blackWallsLeft}
            color="black"
          />
          <Board
            boardState={game.boardState}
            boardSettings={game.boardSettings}
            moveCallback={game.gameControl.moveCallback}
          />
          <GameUserData
            playerData={whitePlayerData}
            wallsLeft={game.gameControl.whiteWallsLeft}
            color="white"
          />
        </div>
        <div className="col-span-full col-start-3 col-end-9 lg:col-span-2 xl:col-span-3 flex flex-col gap-5 w-full h-full items-center">
          <GameMenu historyControl={game.historyControl} />
          <button
            className="w-3/4 px-4 py-2 bg-blue-400 hover:bg-blue-500"
            onClick={game.gameControl.reverseBoard}
          >
            Flip Board
          </button>
          <button
            className="w-3/4 px-4 py-2 bg-blue-400 hover:bg-blue-500"
            onClick={game.gameControl.restart}
          >
            Restart
          </button>
        </div>
      </div>
    </>
  );
}

const GameOverModalOffline = ({
  winner,
  restart,
  text,
}: {
  winner: number;
  restart: () => void;
  text?: string;
}) => {
  const [open, setOpen] = useState(true);

  const _restart = () => {
    setOpen(false);
    restart();
  };

  return (
    <Dialog.Root open={open} onOpenChange={() => setOpen(!open)}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/10 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="flex flex-col gap-5 w-52 items-center text-white bg-zinc-500 z-50 p-5 rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Dialog.Close
            asChild
            className="focus:shadown-none focus:border-none focus:outline-none active:outline-none"
          >
            <button
              className="absolute right-1 top-1 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:bg-background/80 focus:shadow-none "
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
          <Dialog.Title className="text-2xl font-bold">
            {winner == 0 ? "White won!" : "Black won!"}
          </Dialog.Title>
          {text && <h2 className="text-xl">{text}</h2>}
          <button
            onClick={_restart}
            className="px-5 py-2 bg-green-500 rounded-md flex items-center"
          >
            Restart
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
