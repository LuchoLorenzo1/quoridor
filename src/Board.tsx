import { Fragment, MouseEvent, ReactNode, useState } from "react";
import { flushSync } from "react-dom";
import {
  compare,
  getPossibleMoves,
  isWallHovered,
  pickHorizontalWall,
  pickVerticalWall,
  pickWall,
  validateWalls,
} from "./utils";

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
        // document.startViewTransition(() => {
        // 	flushSync(() => wallCallback({ x: row, y: col }, copy[col][row], copy));
        // });
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
      // document.startViewTransition(() => {
      // 	flushSync(() => {
      // 		move(row, col);
      // 	});
      // });
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

  return (
    <div
      onClick={(e) => handleClick(e)}
      onMouseOver={(e) => handleHover(e)}
      onMouseOut={() => setHoveredWall(null)}
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

const PawnComponent = ({ pawn }: { pawn: Pawn }) => {
  return (
    <div
      data-row={pawn.pos.x}
      data-col={pawn.pos.y}
      id={pawn.name}
      style={{ viewTransitionName: pawn.name }}
      className={`z-50 w-9 h-9 rounded-full ${pawn.color}`}
    />
  );
};

const columns = "abcdefghi";
const Cell = ({
  row,
  col,
  children,
}: {
  row: number;
  col: number;
  children: ReactNode;
}) => {
  let cellColor = !((row + col) % 2) ? "bg-zinc-300" : "bg-zinc-600";
  return (
    <div
      key={`${row}-${col}`}
      className={`relative flex items-center justify-center w-12 h-12 ${cellColor}`}
      data-row={row}
      data-col={col}
      id="cell"
    >
      {children}
      {col == 0 && (
        <h5
          className={`select-none text-xs absolute top-0 left-0 mx-0.5 font-bold ${
            !((row + col) % 2) ? "text-zinc-600" : "text-zinc-300"
          }`}
        >
          {row + 1}
        </h5>
      )}
      {row == 0 && (
        <h5
          className={`select-none text-xs absolute bottom-0 right-0 mx-0.5 font-bold ${
            !((row + col) % 2) ? "text-zinc-600" : "text-zinc-300"
          }`}
        >
          {columns[col]}
        </h5>
      )}
    </div>
  );
};

const Wall = ({
  state,
  row,
  col,
  horizontal = false,
  hovered,
}: {
  state: number;
  row: number;
  col: number;
  horizontal?: boolean;
  hovered: boolean;
}) => {
  let color = "bg-white-500";
  if (state != 0) color = "bg-yellow-500";
  if (hovered) color = "bg-yellow-300";

  const size = horizontal ? "w-12 h-4" : "h-12 w-4";

  return (
    <div
      className={`${color} ${size}`}
      id={horizontal ? `horizontal-wall` : `vertical-wall`}
      data-row={row}
      data-col={col}
    />
  );
};

const Intersection = ({
  row,
  col,
  state,
  hovered,
}: {
  row: number;
  col: number;
  state: { row: number; col: number };
  hovered: boolean;
}) => {
  let color = "bg-white-500";
  if (state.row == 1 || state.col == 1) {
    color = "bg-yellow-500";
  } else if (hovered) {
    color = "bg-yellow-300";
  }
  return (
    <div
      id="intersection"
      className={`${color} w-4 h-4`}
      data-row={row}
      data-col={col}
    />
  );
};

const WallCol = ({
  f,
  col,
  hoveredWall,
}: {
  f: Wall[];
  col: number;
  hoveredWall: { pos: PawnPos; wall: Wall } | null;
}) => {
  if (col >= 8) return;

  return (
    <div key={`walls-${col}`} className="flex flex-col-reverse">
      {f.map((c, row) => {
        return (
          <Fragment key={`wall-${row}-${col}`}>
            <Wall
              state={c.col}
              row={row}
              col={col}
              hovered={isWallHovered(hoveredWall, row, col)}
            />
            {row < 8 && (
              <Intersection
                row={row}
                col={col}
                state={c}
                hovered={
                  !!hoveredWall &&
                  hoveredWall.pos.x == row &&
                  hoveredWall.pos.y == col
                }
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

const CellCol = ({
  f,
  col,
  hoveredWall,
  pawns,
  currPawnPosAdj,
}: {
  f: Wall[];
  col: number;
  hoveredWall: { pos: PawnPos; wall: Wall } | null;
  pawns: Pawn[];
  currPawnPosAdj: PawnPos[];
}) => {
  return (
    <div className="flex flex-col-reverse">
      {f.map((c, row) => {
        let wall;
        if (row < 8)
          wall = (
            <Wall
              state={c.row}
              hovered={isWallHovered(hoveredWall, row, col, true)}
              row={row}
              col={col}
              horizontal={true}
            />
          );

        let ghostPawn: Pawn | null = null;
        for (let i of currPawnPosAdj) {
          if (i.x == row && i.y == col) {
            ghostPawn = {
              pos: { x: row, y: col },
              name: "ghostPawn",
              color: "bg-neutral-400",
            };
            break;
          }
        }

        let pawn: Pawn | null = null;
        for (let i of pawns) {
          if (i.pos.x == row && i.pos.y == col) {
            pawn = i;
          }
        }

        return (
          <Fragment key={`cell-${row}-${col}`}>
            <Cell row={row} col={col}>
              {ghostPawn ? <PawnComponent pawn={ghostPawn} /> : ""}
              {pawn ? <PawnComponent pawn={pawn} /> : ""}
            </Cell>
            {wall}
          </Fragment>
        );
      })}
    </div>
  );
};

export default Board;
