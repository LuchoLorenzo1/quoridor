"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Socket } from "socket.io-client";
import NewGameButton from "./NewGameButton";
import RespondRematch from "./RespondRematch";
import Spinner from "./Spinner";

const GameOverModal = ({
  title,
  text,
  time = 30,
  rematchState,
}: {
  title: string;
  gameSocket?: Socket;
  text?: string;
  time?: number;
  rematchState?: {
    rematch: boolean;
    sendRematch: () => void;
    text: string;
    rejectRematch: () => void;
  };
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  const _sendRematch = () => {
    rematchState?.sendRematch();
    setOpen(false);
  };

  console.log(rematchState);
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
          <NewGameButton
            time={time}
            className="w-3/4 text-center font-bold flex-none"
          />
          {rematchState ? (
            rematchState.rematch ? (
              <>
                <h1 className="text-sm font-bold text-stone-200 mt-2">
                  {rematchState.text}
                </h1>
                <RespondRematch
                  rejectRematch={rematchState.rejectRematch}
                  sendRematch={_sendRematch}
                />{" "}
              </>
            ) : (
              <button
                onClick={_sendRematch}
                className="py-2 bg-green-500 rounded-md w-3/4 text-center font-bold"
              >
                Rematch
              </button>
            )
          ) : (
            ""
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default GameOverModal;
