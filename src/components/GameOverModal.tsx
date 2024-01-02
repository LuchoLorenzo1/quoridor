"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Socket } from "socket.io-client";
import NewGameButton from "./NewGameButton";

const GameOverModal = ({
  title,
  gameSocket,
  text,
  time = 30,
}: {
  title: string;
  gameSocket?: Socket;
  text?: string;
  time?: number;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  const rematch = () => {
    if (gameSocket) {
      gameSocket.emit("rematch");
      setOpen(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={() => setOpen(!open)}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/10 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="flex flex-col gap-5 w-60 items-center text-white bg-stone-500 z-50 p-5 rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
          <Dialog.Title className="text-2xl font-bold">{title}</Dialog.Title>
          {text && <h2>{text}</h2>}
          <NewGameButton time={time} />
          {gameSocket && (
            <button
              onClick={rematch}
              className="px-5 py-2 bg-green-500 rounded-md flex items-center"
            >
              Rematch
            </button>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default GameOverModal;
