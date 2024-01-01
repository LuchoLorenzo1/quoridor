import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

const GameMenu = ({
  historyControl: { history, activeMove, goBack, goForward },
  className,
}: {
  historyControl: {
    history: string[];
    activeMove: number;
    goBack: (i: number) => void;
    goForward: (i: number) => void;
  };
  className?: string;
}) => {
  const pairs = pairElements(history);

  const refScroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!history) return;

    let refIndex = activeMove == 0 ? 0 : Math.floor((activeMove - 1) / 2);
    if (refIndex < 0 || refIndex >= history.length) return;

    let divRef = refScroll.current;
    if (divRef != null)
      divRef.scrollTo({
        top: refIndex * 50,
        behavior: "smooth",
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMove]);

  if (!history) return;

  return (
    <div
      ref={refScroll}
      className={twMerge(
        "w-full h-64 bg-stone-600 text-stone-200 no-scrollbar overflow-y-scroll p-2",
        className,
      )}
    >
      {pairs.map((m, i) => {
        return (
          <div className="gap-2 flex items-center mb-1" key={i}>
            <h2 className="select-none text-stone-800">{i + 1}.</h2>
            <MoveButton
              i={1 + i * 2}
              value={m[0]}
              activeMove={activeMove}
              goForward={goForward}
              goBack={goBack}
            />
            <MoveButton
              i={2 + i * 2}
              value={m[1]}
              activeMove={activeMove}
              goForward={goForward}
              goBack={goBack}
            />
          </div>
        );
      })}
    </div>
  );
};

const MoveButton = ({
  value,
  activeMove,
  i,
  goForward,
  goBack,
}: {
  value: string;
  activeMove: number;
  i: number;
  goForward: (i: number) => void;
  goBack: (i: number) => void;
}) => {
  return (
    <button
      onClick={() => (i > activeMove ? goForward(i) : goBack(i))}
      className={`select-none font-bold py-0.5 px-2 rounded-md active:focus:bg-stone-800 outline-none ${
        activeMove == i ? "text-black bg-white" : "hover:bg-stone-800"
      }`}
    >
      {value}
    </button>
  );
};

const pairElements = (arr: string[]): string[][] => {
  const paired = [];
  for (let i = 0; i < arr.length; i += 2) {
    if (i + 1 < arr.length) {
      paired.push([arr[i], arr[i + 1]]);
    } else {
      paired.push([arr[i]]);
    }
  }
  return paired;
};

export default GameMenu;
