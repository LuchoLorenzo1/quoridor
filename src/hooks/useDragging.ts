import { useRef, DragEvent, Dispatch, SetStateAction } from "react";
import { Pawn, PawnPos, Wall } from "../Board";
import { getPossibleMoves } from "../utils";

const useDragging = (
  pawns: Pawn[],
  walls: Wall[][],
  turn: number,
  move: (row: number, col: number) => void,
  setCurrPawnPosAdj: Dispatch<SetStateAction<PawnPos[]>>,
) => {
  let currentDragingCell = useRef<PawnPos | null>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const id = target.id;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (!_row || !_col || currentDragingCell == null) return;
    if (id != "cell" && id != "ghostPawn") return;

    let row = +_row;
    let col = +_col;

    currentDragingCell.current = { x: row, y: col };
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.id != pawns[turn].name || currentDragingCell.current == null)
      return;
    move(currentDragingCell.current.x, currentDragingCell.current.y);

    currentDragingCell.current = null;
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (target.id != pawns[turn].name || !_row || !_col)
      return e.preventDefault();
    let row = +_row;
    let col = +_col;
    e.dataTransfer.setDragImage(document.createElement("span"), 0, 0);

    currentDragingCell.current = { x: row, y: col };
    let adjs = getPossibleMoves(
      pawns[turn].pos,
      pawns[turn == 0 ? 1 : 0].pos,
      walls,
    );

    setCurrPawnPosAdj(adjs);
  };

  return {
    currentDragingCell,
    handleDragEnd,
    handleDragEnter,
    handleDragStart,
  };
};

export default useDragging;
