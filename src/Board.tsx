import { Fragment, MouseEvent, useRef, useState } from "react";
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
import useDragging from "./hooks/useDragging";

export interface BoardComponentProps {
  moveCallback: (pos: PawnPos) => void;
  wallCallback: (pos: PawnPos, wall: Wall, copy: Wall[][]) => void;
  turn: number;
  walls: Wall[][];
  pawns: Pawn[];
  interactive: boolean;
  lastMove: PawnPos | null;
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

export interface CellState {
  pawn?: Pawn;
  hoveredWall: string;
  row: number;
  col: number;
  highlightCell: string;
}

const WALLS_IDS = ["horizontal-wall", "vertical-wall", "intersection"];

const Board = ({
  turn,
  pawns,
  walls,
  moveCallback,
  wallCallback,
  interactive,
  lastMove,
}: BoardComponentProps) => {
  const [hoveredWall, setHoveredWall] = useState<{
    pos: PawnPos;
    wall: string;
  } | null>(null);
  const [currPawnPosAdj, setCurrPawnPosAdj] = useState<PawnPos[]>([]);
  const { handleDragStart, handleDragEnd, handleDragEnter } = useDragging(
    pawns,
    walls,
    turn,
    move,
    setCurrPawnPosAdj,
  );

  function move(row: number, col: number) {
    getPossibleMoves(
      pawns[turn].pos,
      pawns[turn == 0 ? 1 : 0].pos,
      walls,
    ).forEach(({ x, y }) => {
      if (x == row && y == col) {
        moveCallback({ x, y });
        setCurrPawnPosAdj([]);
      }
    });
  }

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
      setHoveredWall({ pos: { x: r.row, y: r.col }, wall: "h" });
    } else if (id == "vertical-wall") {
      let r = pickVerticalWall(row, col, walls);
      if (!r) return setHoveredWall(null);
      setHoveredWall({ pos: { x: r.row, y: r.col }, wall: "v" });
    } else {
      return setHoveredWall(null);
    }
  };

  let matrix = structuredClone(walls) as CellState[][];
  for (let pawn of pawns) {
    matrix[pawn.pos.y][pawn.pos.x].pawn = pawn;
  }

  for (let pawn of currPawnPosAdj) {
    matrix[pawn.y][pawn.x].pawn = {
      pos: { x: pawn.x, y: pawn.y },
      name: "ghostPawn",
      color: "bg-neutral-400",
    };
  }

  if (lastMove) {
    matrix[lastMove.y][lastMove.x].highlightCell = "bg-orange-300";
    let p = pawns[turn == 0 ? 1 : 0];
    matrix[p.pos.y][p.pos.x].highlightCell = "bg-orange-300";
  }

  if (hoveredWall) {
    if (hoveredWall.wall == "h") {
      matrix[hoveredWall.pos.y][hoveredWall.pos.x].hoveredWall = "h";
      matrix[hoveredWall.pos.y + 1][hoveredWall.pos.x].hoveredWall = "H";
    } else if (hoveredWall.wall == "v") {
      matrix[hoveredWall.pos.y][hoveredWall.pos.x].hoveredWall = "v";
      matrix[hoveredWall.pos.y][hoveredWall.pos.x + 1].hoveredWall = "V";
    }
  }

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
      {matrix.map((f, col) => {
        return (
          <Fragment key={col}>
            <CellCol col={col} f={f} />
            <WallCol col={col} f={f} />
          </Fragment>
        );
      })}
    </div>
  );
};

export default Board;
