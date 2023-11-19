import { useState } from "react";
import Board, { Pawn, PawnPos, Wall } from "./Board";

export const BoardLogic = () => {
  const [turn, setTurn] = useState<number>(0);
  const [whitePawnPos, setWhitePawnPos] = useState<PawnPos>({ x: 0, y: 4 });
  const [blackPawnPos, setBlackPawnPos] = useState<PawnPos>({ x: 8, y: 4 });
  const [walls, setWalls] = useState<Wall[][]>(matrix(9, 9));

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

  return (
    <>
      <h1>Turn: {turn == 0 ? "White" : "Black"}</h1>
      <Board
        turn={turn}
        moveCallback={moveCallback}
        wallCallback={wallCallback}
        walls={walls}
        pawns={pawns}
      />
    </>
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
