import { useEffect, useState } from "react";
import Board, { Pawn, PawnPos, Wall } from "./Board";
import { flushSync } from "react-dom";

const WHITE_START = { x: 0, y: 4 };
const BLACK_START = { x: 8, y: 4 };

export const BoardLogic = () => {
  const [turn, setTurn] = useState<number>(0);
  const [whitePawnPos, setWhitePawnPos] = useState<PawnPos>(WHITE_START);
  const [blackPawnPos, setBlackPawnPos] = useState<PawnPos>(BLACK_START);
  const [walls, setWalls] = useState<Wall[][]>(matrix(9, 9));
  const [winner, setWinner] = useState<number | null>(null);

  const moveCallback = (pos: PawnPos) => {
    if (turn == 0) {
      setWhitePawnPos(pos);
      setTurn(1);
    } else {
      setBlackPawnPos(pos);
      setTurn(0);
    }
  };

  const wallCallback = (_: Wall, copy: Wall[][]) => {
    setWalls(copy);
    if (turn == 0) {
      setTurn(1);
    } else {
      setTurn(0);
    }
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
  };

  useEffect(() => {
    pawns.forEach((pawn, i) => {
      if (pawn.pos.x == pawn.end) {
        setWinner(i);
      }
    });
  }, [blackPawnPos, whitePawnPos]);

  return (
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
  );
};

function matrix(m: number, n: number): Wall[][] {
  return Array.from(
    {
      length: m,
    },
    () => new Array(n).fill({ row: 0, col: 0 }),
  );
}
