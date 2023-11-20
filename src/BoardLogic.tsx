import { useEffect, useState } from "react";
import Board, { Pawn, PawnPos, Wall } from "./Board";
import { matrix } from "./utils";
import { useHistory } from "./useHistory";

export const WHITE_START = { x: 0, y: 4 };
export const BLACK_START = { x: 8, y: 4 };

export const BoardLogic = () => {
  const [turn, setTurn] = useState<number>(0);
  const [whitePawnPos, setWhitePawnPos] = useState<PawnPos>(WHITE_START);
  const [blackPawnPos, setBlackPawnPos] = useState<PawnPos>(BLACK_START);
  const [walls, setWalls] = useState<Wall[][]>(matrix(9, 9));
  const [winner, setWinner] = useState<number | null>(null);
  const { history, setHistory, moveCallbackHistory, activeMove, control } =
    useHistory({
      setWhitePawnPos,
      setBlackPawnPos,
      setWalls,
    });

  const moveCallback = (pos: PawnPos) => {
    if (activeMove != history.length) return;
    if (turn == 0) {
      setWhitePawnPos(pos);
      setTurn(1);
    } else {
      setBlackPawnPos(pos);
      setTurn(0);
    }
    moveCallbackHistory(pos);
  };

  const wallCallback = (pos: PawnPos, w: Wall, copy: Wall[][]) => {
    if (activeMove != history.length) return;
    setWalls(copy);
    setTurn(turn == 0 ? 1 : 0);
    moveCallbackHistory(pos, w);
  };

  const pawns: Pawn[] = [
    { pos: whitePawnPos, name: "whitePawn", end: 8, color: "bg-white" },
    { pos: blackPawnPos, name: "blackPawn", end: 0, color: "bg-black" },
  ];

  const restart = () => {
    setWhitePawnPos(WHITE_START);
    setBlackPawnPos(BLACK_START);
    setTurn(0);
    setWalls(matrix(9, 9));
    setWinner(null);
    setHistory([]);
  };

  useEffect(() => {
    pawns.forEach((pawn, i) => {
      if (pawn.pos.x == pawn.end) {
        setWinner(i);
      }
    });
  }, [blackPawnPos, whitePawnPos]);

  return (
    <div className="flex justify-center items-center gap-5 h-full w-full">
      <div className="flex flex-col justify-center items-center gap-5">
        <h1>Turn: {turn == 0 ? "White" : "Black"}</h1>
        {winner && <h1>{winner == 0 ? "White" : "Black"} Wins !</h1>}
        <Board
          turn={turn}
          moveCallback={moveCallback}
          wallCallback={wallCallback}
          walls={walls}
          pawns={pawns}
        />
        {winner && (
          <button
            onClick={() => restart()}
            className="px-5 py-2 bg-green-500 rounded-md"
          >
            Restart
          </button>
        )}
      </div>
      <div className="flex flex-col items-center justify-center h-[50%]">
        <div className="bg-red-200 w-32 overflow-y-scroll flex-col flex-grow h-full">
          {history &&
            history.length > 0 &&
            history.map((m, i) => {
              return (
                <h1
                  className={activeMove - 1 == i ? "bg-red-500" : ""}
                  key={`${i}`}
                >{`${i}. ${m}`}</h1>
              );
            })}
        </div>
        <div className="flex gap-1">
          <ControlToolBar control={control} />
        </div>
      </div>
    </div>
  );
};
interface ActiveMoveControl {
  goFullBack: () => void;
  goFullForward: () => void;
  goForward: () => void;
  goBack: () => void;
}

const ControlToolBar = ({ control }: { control: ActiveMoveControl }) => {
  return (
    <>
      <button
        onClick={() => control.goFullBack()}
        className="px-3 py-1 bg-green-500 rounded-md"
      >
        {"<<"}
      </button>
      <button
        onClick={() => control.goBack()}
        className="px-3 py-1 bg-green-500 rounded-md"
      >
        {"<"}
      </button>
      <button
        onClick={() => control.goForward()}
        className="px-3 py-1 bg-green-500 rounded-md"
      >
        {">"}
      </button>
      <button
        onClick={() => control.goFullForward()}
        className="px-3 py-1 bg-green-500 rounded-md"
      >
        {">>"}
      </button>
    </>
  );
};
ConstantSourceNode;

const columns = "abcdefghi";
export const moveToString = (move: PawnPos, wall?: Wall): string => {
  return `${columns[move.y]}${move.x + 1}${wall ? (wall.col ? "v" : "h") : ""}`;
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
