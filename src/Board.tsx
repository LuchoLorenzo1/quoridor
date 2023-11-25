import { Fragment, MouseEvent, DragEvent, useState } from "react";
import {
  compare,
  getPossibleMoves,
  pickHorizontalWall,
  pickVerticalWall,
  pickWall,
  validateWalls,
} from "./utils";
import CellCol from "./components/CellCol";
import WallCol from "./components/WallCol";

export interface BoardComponentProps {
  moveCallback: (pos: PawnPos) => void;
  wallCallback: (pos: PawnPos, wall: Wall, copy: Wall[][]) => void;
  turn: number;
  walls: Wall[][];
  pawns: Pawn[];
  interactive: boolean;
}

export interface Pawn {
  pos: PawnPos;
  name: string;
  end?: number;
  color: string;
}

export interface PawnPos {
  x: number;
  y: number;
}

export interface Wall {
  row: number;
  col: number;
}

const WALLS_IDS = ["horizontal-wall", "vertical-wall", "intersection"];

const Board = ({
  turn,
  pawns,
  walls,
  moveCallback,
  wallCallback,
  interactive,
}: BoardComponentProps) => {
  const [hoveredWall, setHoveredWall] = useState<{
    pos: PawnPos;
    wall: Wall;
  } | null>(null);
  const [currPawnPosAdj, setCurrPawnPosAdj] = useState<PawnPos[]>([]);
  const [currentDragingCell, setCurrentDraggingCell] = useState<PawnPos | null>(
    null,
  );

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const target = e.target as HTMLDivElement;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (!_row || !_col) return;
    let row = +_row;
    let col = +_col;

    if (WALLS_IDS.includes(target.id)) {
      if (currPawnPosAdj.length != 0) return setCurrPawnPosAdj([]);

      const res = pickWall(target.id, row, col, walls);
      if (res && validateWalls(pawns, res.walls)) {
        wallCallback(
          { x: res.row, y: res.col },
          res.walls[res.col][res.row],
          res.walls,
        );
        setHoveredWall(null);
      }
    }

    if (
      target.id == pawns[turn].name ||
      (target.id == "cell" && compare(pawns[turn].pos, row, col))
    ) {
      if (currPawnPosAdj.length > 0) return setCurrPawnPosAdj([]);

      let adjs = getPossibleMoves(
        pawns[turn].pos,
        pawns[turn == 0 ? 1 : 0].pos,
        walls,
      );
      return setCurrPawnPosAdj(adjs);
    }

    if (target.id == "cell" || target.id == "ghostPawn") {
      if (currPawnPosAdj.length == 0) return;
      move(row, col);
    }

    setCurrPawnPosAdj([]);
  };

  const move = (row: number, col: number) => {
    getPossibleMoves(
      pawns[turn].pos,
      pawns[turn == 0 ? 1 : 0].pos,
      walls,
    ).forEach(({ x, y }) => {
      if (x == row && y == col) {
        moveCallback({ x, y });
      }
    });
  };

  const handleHover = (e: MouseEvent<HTMLDivElement>) => {
    if (!interactive || currPawnPosAdj.length != 0) return;
    const target = e.target as HTMLDivElement;
    const id = target.id;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (!_row || !_col) return;
    let row = +_row;
    let col = +_col;

    if (id == "horizontal-wall" || id == "intersection") {
      let r = pickHorizontalWall(row, col, walls);
      if (!r) return setHoveredWall(null);
      setHoveredWall({ pos: { x: r.row, y: r.col }, wall: { row: 0, col: 1 } });
    } else if (id == "vertical-wall") {
      let r = pickVerticalWall(row, col, walls);
      if (!r) return setHoveredWall(null);
      setHoveredWall({ pos: { x: r.row, y: r.col }, wall: { row: 1, col: 0 } });
    } else {
      return setHoveredWall(null);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const id = target.id;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (!_row || !_col || currentDragingCell == null) return;
    if (id != "cell" && id != "ghostPawn") return;

    let row = +_row;
    let col = +_col;
    setCurrentDraggingCell({ x: row, y: col });
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.id != pawns[turn].name || currentDragingCell == null) return;
    move(currentDragingCell.x, currentDragingCell.y);
    setCurrentDraggingCell(null);
    setCurrPawnPosAdj([]);
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

    setCurrentDraggingCell({ x: row, y: col });
    let adjs = getPossibleMoves(
      pawns[turn].pos,
      pawns[turn == 0 ? 1 : 0].pos,
      walls,
    );
    return setCurrPawnPosAdj(adjs);
  };

  return (
    <div
      onClick={(e) => handleClick(e)}
      onMouseOver={(e) => handleHover(e)}
      onMouseOut={() => setHoveredWall(null)}
      onDragEnter={handleDragEnter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      className="flex"
    >
      {walls.map((f, col) => {
        return (
          <Fragment key={`col-${col}`}>
            <CellCol
              col={col}
              f={f}
              hoveredWall={hoveredWall}
              currPawnPosAdj={currPawnPosAdj}
              pawns={pawns}
            />
            <WallCol col={col} f={f} hoveredWall={hoveredWall} />
          </Fragment>
        );
      })}
    </div>
  );
};

export default Board;
