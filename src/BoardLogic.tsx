import { createRef, useEffect, useState, RefObject } from "react";
import Board, { Pawn, PawnPos, Wall } from "./Board";
import { matrix } from "./utils";
import { useHistory } from "./useHistory";

export const WHITE_START = { x: 0, y: 4 };
export const BLACK_START = { x: 8, y: 4 };

export const BoardLogic = () => {
  const [turn, setTurn] = useState<number>(0);
  const [interactive, setInteractive] = useState<boolean>(true);
  const [whitePawnPos, setWhitePawnPos] = useState<PawnPos>(WHITE_START);
  const [blackPawnPos, setBlackPawnPos] = useState<PawnPos>(BLACK_START);
  const [walls, setWalls] = useState<Wall[][]>(matrix(9, 9));
  const [winner, setWinner] = useState<number | null>(null);
  const {
    history,
    setHistory,
    moveCallbackHistory,
    activeMove,
    setActiveMove,
    control,
  } = useHistory({
    setWhitePawnPos,
    setBlackPawnPos,
    setWalls,
  });

  const pawns: Pawn[] = [
    { pos: whitePawnPos, name: "whitePawn", end: 8, color: "bg-white" },
    { pos: blackPawnPos, name: "blackPawn", end: 0, color: "bg-black" },
  ];

  const moveCallback = (pos: PawnPos) => {
    if (activeMove != history.length) return;
    if (turn == 0) {
      setWhitePawnPos(pos);
      setTurn(1);
    } else {
      setBlackPawnPos(pos);
      setTurn(0);
    }
    if (pawns[turn].end == pos.x) {
      setWinner(turn);
      setInteractive(false);
    }
    moveCallbackHistory(pos);
  };

  const wallCallback = (pos: PawnPos, w: Wall, copy: Wall[][]) => {
    if (activeMove != history.length) return;
    setWalls(copy);
    setTurn(turn == 0 ? 1 : 0);
    moveCallbackHistory(pos, w);
  };

  const restart = () => {
    setWhitePawnPos(WHITE_START);
    setBlackPawnPos(BLACK_START);
    setTurn(0);
    setWalls(matrix(9, 9));
    setWinner(null);
    setInteractive(true);
    setHistory([]);
    setActiveMove(0);
  };

  useEffect(() => {
    setInteractive(activeMove == history.length);
  }, [activeMove]);

  return (
    <div className="flex justify-center items-center gap-5 h-full w-full">
      <div className="flex flex-col justify-center items-center gap-5">
        <h1>Turn: {turn == 0 ? "White" : "Black"}</h1>
        {winner != null && <h1>{winner == 0 ? "White" : "Black"} Wins !</h1>}
        <Board
          turn={turn}
          moveCallback={moveCallback}
          wallCallback={wallCallback}
          walls={walls}
          pawns={pawns}
          interactive={interactive}
        />
        {winner != null && (
          <button
            onClick={() => restart()}
            className="px-5 py-2 bg-green-500 rounded-md"
          >
            Restart
          </button>
        )}
      </div>
      <GameMenu history={history} activeMove={activeMove} control={control} />
    </div>
  );
};

const GameMenu = ({
  history,
  activeMove,
  control,
}: {
  history: string[];
  activeMove: number;
  control: ActiveMoveControl;
}) => {
  if (!history) return;
  const pairs = pairElements(history);

  const refs = pairs.reduce<Record<number, RefObject<HTMLDivElement>>>(
    (acc, _, i) => {
      acc[i] = createRef<HTMLDivElement>();
      return acc;
    },
    {},
  );

  useEffect(() => {
    let refIndex = activeMove == 0 ? 0 : Math.floor((activeMove - 1) / 2);
    if (refIndex < 0 || refIndex >= history.length) return;

    let divRef = refs[refIndex].current;
    if (divRef != null)
      divRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [activeMove]);

  return (
    <div className="flex flex-col items-center justify-center h-[50%]">
      <div className="w-52 bg-stone-600 no-scrollbar overflow-y-scroll h-full p-2 text-white">
        {pairs.map((m, i) => {
          return (
            <div ref={refs[i]} className="gap-2 flex items-center mb-1" key={i}>
              <h2 className="select-none">{i + 1}.</h2>
              <MoveButton
                i={1 + i * 2}
                value={m[0]}
                activeMove={activeMove}
                control={control}
              />
              <MoveButton
                i={2 + i * 2}
                value={m[1]}
                activeMove={activeMove}
                control={control}
              />
            </div>
          );
        })}
      </div>
      <ControlToolBar
        control={control}
        history={history}
        activeMove={activeMove}
      />
    </div>
  );
};

const MoveButton = ({
  value,
  activeMove,
  i,
  control,
}: {
  value: string;
  activeMove: number;
  i: number;
  control: ActiveMoveControl;
}) => {
  return (
    <button
      onClick={() =>
        i > activeMove ? control.goForward(i) : control.goBack(i)
      }
      className={`select-none py-0.5 px-2 rounded-md ${
        activeMove == i ? "text-black bg-white" : "hover:bg-slate-500"
      }`}
    >
      {value}
    </button>
  );
};

interface ActiveMoveControl {
  goForward: (i: number) => void;
  goBack: (i: number) => void;
}

const ControlToolBar = ({
  control,
  history,
  activeMove,
}: {
  control: ActiveMoveControl;
  history: string[];
  activeMove: number;
}) => {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => control.goBack(0)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {"<<"}
      </button>
      <button
        onClick={() => control.goBack(activeMove - 1)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {"<"}
      </button>
      <button
        onClick={() => control.goForward(activeMove + 1)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {">"}
      </button>
      <button
        onClick={() => control.goForward(history.length)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {">>"}
      </button>
    </div>
  );
};

const columns = "abcdefghi";
export const moveToString = (move: PawnPos, wall?: Wall): string => {
  return `${columns[move.y]}${move.x + 1}${
    wall ? (wall.col == 1 ? "v" : "h") : ""
  }`;
};

export const stringToMove = (move: string): { pos: PawnPos; wall?: Wall } => {
  let y = columns.indexOf(move[0]);
  let x = +move[1] - 1;

  let wall;
  if (move[2] == "v") {
    wall = { col: 1, row: 0 };
  } else if (move[2] == "h") {
    wall = { col: 0, row: 1 };
  }

  return {
    pos: { x, y },
    wall,
  };
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
