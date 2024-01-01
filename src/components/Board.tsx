import { Fragment, MouseEvent, useState } from "react";
import {
  getPossibleMoves,
  pickHorizontalWall,
  pickVerticalWall,
  pickWall,
  validateWalls,
} from "@/utils";
import CellCol from "@/components/CellCol";
import WallCol from "@/components/WallCol";
import useDragging from "@/hooks/useDragging";

export interface Pawn {
  pos: PawnPos;
  name: string;
  end?: number;
  color: string;
  isPlaying: boolean;
}

export interface PawnPos {
  x: number;
  y: number;
}

export interface Wall {
  row: number;
  col: number;
  verticallWallPlayer?: number;
  horizontalWallPlayer?: number;
}

export interface CellState {
  pawn?: Pawn;
  hoveredWall: string;
  row: number;
  col: number;
  highlightCell: string;
  verticallWallPlayer?: number;
  horizontalWallPlayer?: number;
}

const WALLS_IDS = ["horizontal-wall", "vertical-wall", "intersection"];

export const WHITE_START = { x: 0, y: 4 };
export const BLACK_START = { x: 8, y: 4 };

export interface BoardComponentProps {
  moveCallback: (pos: PawnPos, wall?: Wall) => void;
  boardState: {
    turn: number;
    walls: Wall[][];
    pawns: Pawn[];
    lastMove: PawnPos[];
  };
  boardSettings: {
    reversed: boolean;
    interactive: boolean;
  };
}

const Board = ({
  boardState: { turn, walls, pawns, lastMove },
  boardSettings: { reversed, interactive },
  moveCallback,
}: BoardComponentProps) => {
  const [hoveredWall, setHoveredWall] = useState<{
    pos: PawnPos;
    wall: string;
  } | null>(null);
  const [currPawnPosAdj, setCurrPawnPosAdj] = useState<PawnPos[]>([]);
  const [selectedCells, setSelectedCells] = useState<PawnPos[]>([]);

  const {
    currentDraggingCell,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
  } = useDragging(
    pawns,
    walls,
    turn,
    move,
    setCurrPawnPosAdj,
    setSelectedCells,
    interactive,
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

    setSelectedCells([]);

    if (WALLS_IDS.includes(target.id)) {
      if (currPawnPosAdj.length != 0) return setCurrPawnPosAdj([]);

      const res = pickWall(target.id, row, col, walls);
      if (res && validateWalls(pawns, res.walls)) {
        moveCallback({ x: res.row, y: res.col }, res.walls[res.col][res.row]);
        setHoveredWall(null);
      }
    }

    if (
      target.id == pawns[turn].name ||
      (target.id == "cell" &&
        pawns[turn].pos.x == row &&
        pawns[turn].pos.y == col)
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

  const handleRightClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const target = e.target as HTMLDivElement;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (!_row || !_col) return;
    let row = +_row;
    let col = +_col;

    if (target.id == "cell" || target.id.includes("Pawn")) {
      if (selectedCells.find((e) => e.x == row && e.y == col)) {
        setSelectedCells((c) => c.filter((e) => e.x != row || e.y != col));
      } else {
        setSelectedCells((c) => [...c, { x: row, y: col }]);
      }
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
      isPlaying: false,
    };
  }

  if (lastMove.length == 2) {
    matrix[lastMove[0].y][lastMove[0].x].highlightCell = "bg-orange-300";
    matrix[lastMove[1].y][lastMove[1].x].highlightCell = "bg-orange-300";
  }

  if (currentDraggingCell) {
    let m = matrix[currentDraggingCell.y][currentDraggingCell.x];
    if (m.pawn?.name == "ghostPawn") {
      m.highlightCell = "bg-blue-300";
    }
  }

  for (const cell of selectedCells) {
    matrix[cell.y][cell.x].highlightCell = "bg-red-500 opacity-50";
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
      onContextMenu={(e) => handleRightClick(e)}
      onMouseOver={(e) => handleHover(e)}
      onMouseOut={(e) => setHoveredWall(null)}
      onDragEnter={handleDragEnter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      className={`flex ${reversed ? "flex-row-reverse" : ""}`}
    >
      {matrix.map((f, col) => {
        return (
          <Fragment key={col}>
            <CellCol
              reversed={reversed}
              col={col}
              f={f}
              size="min-w-[2.5rem] sm:w-[3.3rem]  md:w-[3.5rem] lg:w-[3.9rem]"
            />
            <WallCol
              reversed={reversed}
              col={col}
              f={f}
              size="min-w-[0.833333rem] sm:w-[1.1rem] md:w-[1.166667rem] lg:w-[1.3rem]"
            />
          </Fragment>
        );
      })}
    </div>
  );
};

("bg-black");
export default Board;
