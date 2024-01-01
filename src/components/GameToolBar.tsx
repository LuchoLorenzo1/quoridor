import { FaRetweet } from "react-icons/fa";

const ControlToolBar = ({
  goForward,
  goBack,
  activeMove,
  reverseBoard,
}: {
  goForward: (i: number) => void;
  goBack: (i: number) => void;
  activeMove: number;
  reverseBoard: () => void;
}) => {
  const buttonClass =
    "select-none px-3 bg-green-500 text-stone-200 bg-stone-600 hover:bg-stone-500 focus:active:bg-stone-800 font-bold outline-none focus:active:bg-stone-800";
  return (
    <>
      <button onClick={() => goBack(0)} className={buttonClass}>
        {"<<"}
      </button>
      <button onClick={() => goBack(activeMove - 1)} className={buttonClass}>
        {"<"}
      </button>
      <button onClick={() => goForward(activeMove + 1)} className={buttonClass}>
        {">"}
      </button>
      <button onClick={() => goForward(Infinity)} className={buttonClass}>
        {">>"}
      </button>
      <button onClick={reverseBoard} className={buttonClass}>
        <FaRetweet />
      </button>
    </>
  );
};

export default ControlToolBar;
