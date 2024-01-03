import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { twMerge } from "tailwind-merge";

const RespondRematch = ({
  rejectRematch,
  sendRematch,
  className,
}: {
  rejectRematch: () => void;
  sendRematch: () => void;
  className?: string;
}) => {
  return (
    <div
      className={twMerge(
        "flex w-full items-center justify-center gap-3 mx-4",
        className,
      )}
    >
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

export default RespondRematch;
