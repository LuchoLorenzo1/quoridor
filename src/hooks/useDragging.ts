import { useRef, DragEvent, Dispatch, SetStateAction, useState } from "react";
import { Pawn, PawnPos, Wall } from "../Board";
import { getPossibleMoves } from "../utils";

const useDragging = (
  pawns: Pawn[],
  walls: Wall[][],
  turn: number,
  move: (row: number, col: number) => void,
  setCurrPawnPosAdj: Dispatch<SetStateAction<PawnPos[]>>,
  setSelectedCells: Dispatch<SetStateAction<PawnPos[]>>,
) => {
  let [currentDraggingCell, setCurrentDraggingCell] = useState<PawnPos | null>(
    null,
  );

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const id = target.id;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (!_row || !_col || currentDraggingCell == null) return;
    if (id != "cell" && id != "ghostPawn") return;

    let row = +_row;
    let col = +_col;

    setCurrentDraggingCell({ x: row, y: col });
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.id != pawns[turn].name || currentDraggingCell == null) return;
    move(currentDraggingCell.x, currentDraggingCell.y);

    setCurrentDraggingCell(null);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (target.id != pawns[turn].name || !_row || !_col)
      return e.preventDefault();

    setSelectedCells([]);

    let row = +_row;
    let col = +_col;
    e.dataTransfer.setDragImage(document.createElement("span"), 0, 0);

    setCurrentDraggingCell({ x: row, y: col });
    let adjs = getPossibleMoves(
      pawns[turn].pos,
      pawns[turn == 0 ? 1 : 0].pos,
      walls,
    );

    setCurrPawnPosAdj(adjs);
  };

  return {
    currentDraggingCell,
    handleDragEnd,
    handleDragEnter,
    handleDragStart,
  };
};

export default useDragging;
