import { Dispatch, SetStateAction, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Slider from "@radix-ui/react-slider";
import { useRouter } from "next/navigation";
import socket from "@/server";

const CreateGameModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [color, setColor] = useState<string>("random");
  const [rated, setRated] = useState<string>("rated");
  const [minutes, setMinutes] = useState(3);
  const router = useRouter();

  const createGame = () => {
    let seconds = minutes * 60;
    if (minutes == -2) {
      seconds = 15;
    } else if (minutes == -1) {
      seconds = 30;
    } else if (minutes == 0) {
      seconds = 45;
    } else {
      seconds = minutes * 60;
    }
    console.log(seconds, color, rated);

    socket.emit(
      "createChallenge",
      { seconds, color, rated },
      (invitationCode: string) => {
        router.push(`/challenge/${invitationCode}`);
      },
    );
  };

  let m;
  if (minutes == -2) {
    m = "¼";
  } else if (minutes == -1) {
    m = "½";
  } else if (minutes == 0) {
    m = "¾";
  } else {
    m = minutes.toString();
  }

  const itemClassName =
    "rounded-md data-[state=on]:bg-stone-700 data-[state=on]:text-stone-200 py-1 px-2 hover:bg-stone-200 select-none outline-none";
  return (
    <Dialog.Root open={open} onOpenChange={() => setOpen(!open)}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/10 fixed inset-0" />
        <Dialog.Content className="flex flex-col gap-8 min-w-min min-h-min w-full sm:w-[30rem] items-center text-stone-600 bg-white z-50  px-3 py-10 rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Dialog.Close
            asChild
            className="focus:shadown-none focus:border-none focus:outline-none active:outline-none"
          >
            <button
              className="absolute right-1 top-1 inline-flex h-[30px] w-[30px] appearance-none items-center justify-center rounded-full hover:text-stone-200 hover:bg-stone-700 focus:bg-background/80 focus:shadow-none"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
          <Dialog.Title className="text-2xl font-bold">
            Play with a friend
          </Dialog.Title>
          <div className="flex flex-col gap-3 w-full items-center">
            <h1>
              Minutes per side: <span className="font-bold">{m}</span>
            </h1>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-3/4 h-5"
              value={[minutes]}
              onValueChange={(v) => setMinutes(v[0])}
              max={30}
              min={-2}
              step={1}
            >
              <Slider.Track className="bg-stone-700 relative grow rounded-full h-[3px]">
                <Slider.Range className="bg-stone-200 absolute rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-5 h-5 bg-stone-200 rounded-[10px] hover:bg-stone-400 focus:outline-none"
                aria-label="Volume"
              />
            </Slider.Root>
          </div>

          <div className="flex flex-col gap-3 items-center w-full">
            <h1 className="text-xl">Select Game type</h1>
            <ToggleGroup.Root
              className="inline-flex rounded gap-3"
              type="single"
              value={rated}
              onValueChange={(v) => setRated(v)}
            >
              <ToggleGroup.Item className={itemClassName} value="rated">
                Rated
              </ToggleGroup.Item>
              <ToggleGroup.Item className={itemClassName} value="casual">
                Casual
              </ToggleGroup.Item>
            </ToggleGroup.Root>
          </div>

          <div className="flex flex-col gap-3 items-center w-full">
            <h1 className="text-xl">Pick your color</h1>
            <ToggleGroup.Root
              className="inline-flex bg-mauve6 rounded gap-3"
              type="single"
              value={color}
              onValueChange={(v) => setColor(v)}
            >
              <ToggleGroup.Item className={itemClassName} value="white">
                White
              </ToggleGroup.Item>
              <ToggleGroup.Item className={itemClassName} value="random">
                Random
              </ToggleGroup.Item>
              <ToggleGroup.Item className={itemClassName} value="black">
                Black
              </ToggleGroup.Item>
            </ToggleGroup.Root>
          </div>
          <button
            onClick={createGame}
            className="px-4 py-1 rounded-md border-2 border-stone-700 hover:bg-stone-700 hover:text-stone-200 select-none outline-none"
          >
            Create
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateGameModal;
