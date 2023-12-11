"use client";
import Board, { PawnPos, Wall } from "@/components/Board";
import GameMenu from "@/components/GameMenu";
import useGame from "@/hooks/useGame";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";

export default function offline() {
  const game = useGame(null);

  const moveCallback = (pos: PawnPos, wall?: Wall) => {
    if (wall) {
      game.gameControl.moveWall(pos, wall);
    } else {
      game.gameControl.movePawn(pos);
    }
  };

  return (
    <>
      {game.gameControl.winner != null && (
        <GameOverModalOffline
          winner={game.gameControl.winner}
          restart={game.gameControl.restart}
        />
      )}
      <div className="flex justify-center items-center gap-5 h-full w-full">
        <div className="flex flex-col justify-center items-center gap-5">
          <h1>Turn: {game.boardState.turn == 0 ? "White" : "Black"}</h1>
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
        <div className="flex flex-col gap-5 h-full justify-center items-center">
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
}: {
  winner: number;
  restart: () => void;
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
        <Dialog.Content className="flex flex-col gap-5 w-52 items-center text-white bg-zinc-500 z-50 p-5 rounded-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
            {" "}
            {winner == 0 ? "White wins!" : "Black wins!"}
          </Dialog.Title>
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
