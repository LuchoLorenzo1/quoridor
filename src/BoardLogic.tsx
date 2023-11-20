import { useEffect, useState } from "react";
import Board, { Pawn, PawnPos, Wall } from "./Board";
import { flushSync } from "react-dom";
import { matrix } from "./utils";

const WHITE_START = { x: 0, y: 4 };
const BLACK_START = { x: 8, y: 4 };

export const BoardLogic = () => {
  const [turn, setTurn] = useState<number>(0);
  const [whitePawnPos, setWhitePawnPos] = useState<PawnPos>(WHITE_START);
  const [blackPawnPos, setBlackPawnPos] = useState<PawnPos>(BLACK_START);
  const [walls, setWalls] = useState<Wall[][]>(matrix(9, 9));
  const [winner, setWinner] = useState<number | null>(null);
  const { history, goBack, goForward, setHistory } = useHistory({
    setWhitePawnPos,
    setBlackPawnPos,
  });

  const moveCallback = (pos: PawnPos) => {
    if (turn == 0) {
      setWhitePawnPos(pos);
      setTurn(1);
    } else {
      setBlackPawnPos(pos);
      setTurn(0);
    }

    setHistory((h) => [...h, moveToString(pos)]);
  };

  const wallCallback = (pos: PawnPos, w: Wall, copy: Wall[][]) => {
    setWalls(copy);
    if (turn == 0) {
      setTurn(1);
    } else {
      setTurn(0);
    }
    setHistory((h) => [...h, moveToString(pos, w)]);
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
    <div className="flex justify-center items-center gap-5">
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
      <div className="bg-red-200 h-full w-50 overflow-y-scroll flex-col">
        {pairElements(history).map((m, i) => {
          return <h1 key={`${i}`}>{`${i}. ${m[0]} ${m[1] || ""}`}</h1>;
        })}
      </div>
      <button
        onClick={() => goBack()}
        className="px-5 py-2 bg-green-500 rounded-md"
      >
        {"<"}
      </button>
      <button
        onClick={() => goForward()}
        className="px-5 py-2 bg-green-500 rounded-md"
      >
        {">"}
      </button>
    </div>
  );
};

const columns = "abcdefghi";
const moveToString = (move: PawnPos, wall?: Wall): string => {
  return `${columns[move.y]}${move.x + 1}${wall ? (wall.col ? "v" : "h") : ""}`;
};

const stringToMove = (move: string): { pos: PawnPos; wall?: Wall } => {
  let y = columns.indexOf(move[0]);
  let x = +move[1] - 1;

  let wall;
  if (move[3] == "v") {
    wall = { col: 1, row: 0 };
  } else if (move[3] == "h") {
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

const useHistory = ({ setWhitePawnPos, setBlackPawnPos }: any) => {
  const [history, setHistory] = useState<string[]>([]);
  const [redo, setRedo] = useState<string[]>([]);

  const goBack = () => {
    setHistory((h) => {
      if (h.length == 0) return h;

      if (h.length == 1) {
        setWhitePawnPos(WHITE_START);
        setRedo((r) => [...r, h[h.length - 1]]);
        return [];
      }
      if (h.length == 2) {
        setBlackPawnPos(BLACK_START);
        setRedo((r) => [...r, h[h.length - 1]]);
        return h.slice(0, -1);
      }

      let move = stringToMove(h[h.length - 3]);
      console.log(h, h[h.length - 3], move);
      if (h.length % 2 == 0) {
        setBlackPawnPos(move.pos);
      } else {
        setWhitePawnPos(move.pos);
      }
      setRedo((r) => [...r, h[h.length - 1]]);
      return h.slice(0, -1);
    });
  };

  const goForward = () => {
    setHistory((h) => {
      if (redo.length == 0) return h;
      let u = redo[redo.length - 1];
      setRedo((r) => r.slice(0, -1));
      let move = stringToMove(u);
      if (h.length % 2 == 0) {
        setWhitePawnPos(move.pos);
      } else {
        setBlackPawnPos(move.pos);
      }

      return [...h, u];
    });
  };

  useEffect(() => {
    let keydown = false;
    addEventListener("keyup", (e) => {
      keydown = false;
    });
    addEventListener("keydown", (e) => {
      if (keydown) return;
      keydown = true;
      if (e.key == "ArrowLeft") {
        goBack();
      } else if (e.key == "ArrowRight") {
        goForward();
      }
    });
  }, []);

  return { goForward, goBack, history, setHistory };
};
