import { RefObject, createRef, useEffect } from "react";

const GameMenu = ({
  historyControl: { history, activeMove, goBack, goForward },
}: {
  historyControl: {
    history: string[];
    activeMove: number;
    goBack: (i: number) => void;
    goForward: (i: number) => void;
  };
}) => {
  const pairs = pairElements(history);

  const refs = pairs.reduce<Record<number, RefObject<HTMLDivElement>>>(
    (acc, _, i) => {
      acc[i] = createRef<HTMLDivElement>();
      return acc;
    },
    {},
  );

  useEffect(() => {
    if (!history) return;

    let refIndex = activeMove == 0 ? 0 : Math.floor((activeMove - 1) / 2);
    if (refIndex < 0 || refIndex >= history.length) return;

    let divRef = refs[refIndex].current;
    if (divRef != null)
      divRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [activeMove]);

  if (!history) return;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-52 bg-stone-600 no-scrollbar overflow-y-scroll h-full p-2 text-white mb-2">
        {pairs.map((m, i) => {
          return (
            <div ref={refs[i]} className="gap-2 flex items-center mb-1" key={i}>
              <h2 className="select-none">{i + 1}.</h2>
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
      <ControlToolBar
        goForward={goForward}
        goBack={goBack}
        activeMove={activeMove}
      />
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
      className={`select-none py-0.5 px-2 rounded-md ${
        activeMove == i ? "text-black bg-white" : "hover:bg-slate-500"
      }`}
    >
      {value}
    </button>
  );
};

const ControlToolBar = ({
  goForward,
  goBack,
  activeMove,
}: {
  goForward: (i: number) => void;
  goBack: (i: number) => void;
  activeMove: number;
}) => {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => goBack(0)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {"<<"}
      </button>
      <button
        onClick={() => goBack(activeMove - 1)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {"<"}
      </button>
      <button
        onClick={() => goForward(activeMove + 1)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {">"}
      </button>
      <button
        onClick={() => goForward(Infinity)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {">>"}
      </button>
    </div>
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
