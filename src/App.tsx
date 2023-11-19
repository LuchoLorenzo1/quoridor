import { Fragment, MouseEvent, useState } from "react";
import { flushSync } from "react-dom";

interface PawnPos {
  x: number;
  y: number;
}

interface Wall {
  row: number;
  col: number;
}

function App() {
  const [walls, setWalls] = useState<Wall[][]>(matrix(9, 9));
  const [hoveredWall, setHoveredWall] = useState<{
    pos: PawnPos;
    wall: Wall;
  } | null>(null);
  const [whitePawnPos, setWhitePawnPos] = useState<PawnPos>({ x: 0, y: 4 });
  const [whitePawnPosAdj, setWhitePawnPosAdj] = useState<PawnPos[]>([]);
  const [blackPawnPos, setBlackPawnPos] = useState<PawnPos>({ x: 8, y: 4 });
  const [turn, setTurn] = useState<Boolean>(true);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (!_row || !_col) return;
    let row = +_row;
    let col = +_col;

    if (
      ["horizontal-wall", "vertical-wall", "intersection"].includes(target.id)
    ) {
      if (whitePawnPosAdj.length != 0) {
        setWhitePawnPosAdj([]);
        return;
      }
      const copy = PickWall(target.id, row, col, walls);
      if (copy && validateWalls(whitePawnPos, blackPawnPos, copy)) {
        setWalls(copy);
        setTurn(!turn);
		setHoveredWall(null)
      }
    } else if (
      target.id == "whitePawn" ||
      (target.id == "cell" && compare(whitePawnPos, row, col))
    ) {
      if (!turn || whitePawnPosAdj.length > 0) {
        setWhitePawnPosAdj([]);
        return;
      }
      let adjs = getPossibleMoves(whitePawnPos, blackPawnPos, walls);
      setWhitePawnPosAdj(adjs);
      return;
    } else if (target.id == "cell" || target.id == "ghostPawn") {
	  if (turn && whitePawnPosAdj.length == 0)
		  return
      document.startViewTransition(() => {
        flushSync(() => {
          move(row, col);
        });
      });
    }
    setWhitePawnPosAdj([]);
  };

  const move = (row: number, col: number) => {
    if (turn) {
      getPossibleMoves(whitePawnPos, blackPawnPos, walls).forEach(
        ({ x, y }) => {
          if (x == row && y == col) setWhitePawnPos({ x: row, y: col });
        },
      );
    } else {
      getPossibleMoves(blackPawnPos, whitePawnPos, walls).forEach(
        ({ x, y }) => {
          if (x == row && y == col) setBlackPawnPos({ x: row, y: col });
        },
      );
    }
    setTurn(!turn);
  };

  const handleHover = (e: MouseEvent<HTMLDivElement>) => {
    if (whitePawnPosAdj.length != 0)
      // tiene que no estar los ghostsPawn para poder poner pared
      return;
    const target = e.target as HTMLDivElement;
    const id = target.id;
    let _row = target.getAttribute("data-row");
    let _col = target.getAttribute("data-col");
    if (!_row || !_col) return;
    let row = +_row;
    let col = +_col;

    if (id == "horizontal-wall" || id == "intersection") {
      let r = pickHorizontalWall(row, col, walls);
      if (!r) return null;
      setHoveredWall({ pos: { x: r.row, y: r.col }, wall: { row: 0, col: 1 } });
    } else if (id == "vertical-wall") {
      let r = pickVerticalWall(row, col, walls);
      if (!r) return null;
      setHoveredWall({ pos: { x: r.row, y: r.col }, wall: { row: 1, col: 0 } });
    } else {
      return setHoveredWall(null);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1>Turn: {turn ? "White" : "Black"}</h1>
      <div
        onClick={(e) => handleClick(e)}
        onMouseOver={(e) => handleHover(e)}
        className="flex"
      >
        {walls.map((f, col) => {
          return (
            <Fragment key={`col-${col}`}>
              <CellCol
                col={col}
                f={f}
                hoveredWall={hoveredWall}
                whitePawnPosAdj={whitePawnPosAdj}
                whitePawnPos={whitePawnPos}
                blackPawnPos={blackPawnPos}
              />
              <WallCol col={col} f={f} hoveredWall={hoveredWall} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

const Cell = ({
  row,
  col,
  state,
  adjacents,
}: {
  row: number;
  col: number;
  state: number;
  adjacents: PawnPos[];
}) => {
  let cellColor = !((row + col) % 2) ? "bg-slate-300" : "bg-slate-600";
  let pawnName = state == 1 ? "whitePawn" : "blackPawn";

  let isGhost = false;
  for (let i of adjacents) {
    isGhost = (i.x == row && i.y == col) || isGhost;
  }

  let color = state == 1 ? "bg-white" : "bg-black";
  if (isGhost) {
    color = "bg-pink-50";
    pawnName = `ghostPawn`;
  }

  return (
    <div
      key={`${row}-${col}`}
      className={`flex items-center justify-center w-12 h-12 ${cellColor}`}
      data-row={row}
      data-col={col}
      id="cell"
    >
      {(!!state || isGhost) && (
        <div
          data-row={row}
          data-col={col}
          id={pawnName}
          style={{ viewTransitionName: pawnName }}
          className={`w-9 h-9 rounded-full ${color}`}
        />
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
  hovered?: { row: number; col: number };
}) => {
  let color = "bg-white-500";
  if (state.row == 1 || state.col == 1) {
    color = "bg-yellow-500";
  } else if (hovered && (hovered.row == 1 || hovered.col == 1)) {
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

function matrix(m: number, n: number): Wall[][] {
  return Array.from(
    {
      length: m,
    },
    () => new Array(n).fill({ row: 0, col: 0 }),
  );
}

const validateWalls = (
  whitePawnPos: PawnPos,
  blackPawnPos: PawnPos,
  walls: Wall[][],
): boolean => {
  if (whitePawnPos.x == 8 || blackPawnPos.x == 0) return true;
  return dfs(whitePawnPos, 8, walls) && dfs(blackPawnPos, 0, walls);
};

const dfs = (pos: PawnPos, end: number, walls: Wall[][]) => {
  const s = (x: number, y: number) => `${x}${y}`;

  const visited = new Set();
  visited.add(s(pos.x, pos.y));
  const stack = [pos];
  let act;

  while (stack.length > 0) {
    act = stack.pop();
    if (!act) break;
    if (act.x == end) return true;
    getAdjacents(act.x, act.y, walls).forEach(({ x, y }) => {
      if (!visited.has(s(x, y))) {
        visited.add(s(x, y));
        stack.push({ x, y });
      }
    });
  }

  return false;
};

const getAdjacents = (x: number, y: number, walls: Wall[][]): PawnPos[] => {
  let adj = [];
  if (x <= 7 && walls[y][x].row == 0) adj.push({ x: x + 1, y });
  if (y <= 7 && walls[y][x].col == 0) adj.push({ x, y: y + 1 });
  if (y >= 1 && walls[y - 1][x].col == 0) adj.push({ x, y: y - 1 });
  if (x >= 1 && walls[y][x - 1].row == 0) adj.push({ x: x - 1, y });
  return adj;
};

const PickWall = (
  id: string,
  row: number,
  col: number,
  walls: Wall[][],
): Wall[][] | null => {
  if (id == "horizontal-wall" || id == "intersection") {
    let r = pickHorizontalWall(row, col, walls);
    if (!r) return null;
    row = r.row;
    col = r.col;

    const copy: Wall[][] = structuredClone(walls);
    copy[col][row] = { row: 1, col: walls[col][row].col };
    copy[col + 1][row] = { row: 2, col: walls[col + 1][row].col };
    return copy;
  }

  if (id == "vertical-wall") {
    let r = pickVerticalWall(row, col, walls);
    if (!r) return null;
    row = r.row;
    col = r.col;

    const copy = structuredClone(walls);
    copy[col][row] = { row: walls[col][row].row, col: 1 };
    copy[col][row + 1] = { row: walls[col][row + 1].row, col: 2 };
    return copy;
  }
  return null;
};

const pickVerticalWall = (
  row: number,
  col: number,
  walls: Wall[][],
): Wall | null => {
  if (row > 7) row = 7;
  if (col > 7) col = 7;

  if (walls[col][row + 1].col == 1) {
    if (row >= 1 && walls[col][row - 1].row == 0) {
      row -= 1;
    } else {
      return null;
    }
  }

  if (walls[col][row].col != 0) return null;

  if (walls[col][row].row == 1) {
    if (row < 1 || walls[col][row - 1].row == 1 || walls[col][row - 1].col != 0)
      return null;
    row -= 1;
  }
  return { row, col };
};

const pickHorizontalWall = (
  row: number,
  col: number,
  walls: Wall[][],
): Wall | null => {
  if (row > 7) row = 7;
  if (col > 7) col = 7;

  if (walls[col + 1][row].row == 1) {
    if (col >= 1 && walls[col - 1][row].col == 0) {
      col -= 1;
    } else {
      return null;
    }
  }

  if (walls[col][row].row != 0) {
    return null;
  }

  if (walls[col][row].col == 1) {
    if (col < 1 || walls[col - 1][row].col == 1 || walls[col - 1][row].row != 0)
      return null;
    col -= 1;
  }

  return { row, col };
};

const getPossibleMoves = (
  pawnPos: PawnPos,
  otherPawnPos: PawnPos,
  walls: Wall[][],
): PawnPos[] => {
  let adjs = getAdjacents(pawnPos.x, pawnPos.y, walls);

  let adjss = [];
  for (let { x, y } of adjs) {
    if (otherPawnPos.x == x && otherPawnPos.y == y) {
      x = (otherPawnPos.x - pawnPos.x) * 2;
      y = (otherPawnPos.y - pawnPos.y) * 2;
      if (x > 0) {
        // Es porque el otro esta para arriba
        if (walls[pawnPos.y][pawnPos.x + 1].row != 0 || pawnPos.x + x > 8) {
          x -= 1;
          if (walls[pawnPos.y][pawnPos.x + 1].col == 0)
            adjss.push({ x: pawnPos.x + x, y: pawnPos.y + 1 });
          if (walls[pawnPos.y - 1][pawnPos.x + 1].col == 0)
            adjss.push({ x: pawnPos.x + x, y: pawnPos.y - 1 });
        } else {
          adjss.push({ x: pawnPos.x + x, y: pawnPos.y + y });
        }
      }
      if (x < 0) {
        // Es porque el otro esta para abajo
        if (
          (pawnPos.x > 2 && walls[pawnPos.y][pawnPos.x - 2].row != 0) ||
          pawnPos.x + x < 0
        ) {
          x += 1;
          if (walls[pawnPos.y][pawnPos.x - 1].col == 0)
            adjss.push({ x: pawnPos.x + x, y: pawnPos.y + 1 });
          if (walls[pawnPos.y - 1][pawnPos.x - 1].col == 0)
            adjss.push({ x: pawnPos.x + x, y: pawnPos.y - 1 });
        } else {
          adjss.push({ x: pawnPos.x + x, y: pawnPos.y + y });
        }
      }
      if (y > 0) {
        // Es porque el otro esta para derecha
        if (walls[pawnPos.y + 1][pawnPos.x].col != 0 || pawnPos.y + y > 8) {
          y -= 1;
          if (walls[pawnPos.y + 1][pawnPos.x].row == 0)
            adjss.push({ x: pawnPos.x + 1, y: pawnPos.y + y });
          if (walls[pawnPos.y + 1][pawnPos.x - 1].row == 0)
            adjss.push({ x: pawnPos.x - 1, y: pawnPos.y + y });
        } else {
          adjss.push({ x: pawnPos.x + x, y: pawnPos.y + y });
        }
      }
      if (y < 0) {
        // Es porque el otro esta para derecha
        if (
          (pawnPos.y > 2 && walls[pawnPos.y - 2][pawnPos.x].col != 0) ||
          pawnPos.y + y < 0
        ) {
          y += 1;
          if (walls[pawnPos.y - 1][pawnPos.x].row == 0)
            adjss.push({ x: pawnPos.x + 1, y: pawnPos.y + y });
          if (walls[pawnPos.y - 1][pawnPos.x - 1].row == 0)
            adjss.push({ x: pawnPos.x - 1, y: pawnPos.y + y });
        } else {
          adjss.push({ x: pawnPos.x + x, y: pawnPos.y + y });
        }
      }
    } else {
      adjss.push({ x, y });
    }
  }
  return adjss;
};

export default App;

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
            {row < 8 ? (
              <Intersection
                row={row}
                col={col}
                state={c}
                hovered={
                  hoveredWall &&
                  hoveredWall.pos.x == row &&
                  hoveredWall.pos.y == col
                    ? hoveredWall.wall
                    : undefined
                }
              />
            ) : (
              ""
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
  whitePawnPos,
  blackPawnPos,
  whitePawnPosAdj,
}: {
  f: Wall[];
  col: number;
  hoveredWall: { pos: PawnPos; wall: Wall } | null;
  whitePawnPos: PawnPos;
  blackPawnPos: PawnPos;
  whitePawnPosAdj: PawnPos[];
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

        return (
          <Fragment key={`cell-${row}-${col}`}>
            <Cell
              row={row}
              col={col}
              state={
                compare(whitePawnPos, row, col)
                  ? 1
                  : compare(blackPawnPos, row, col)
                  ? 2
                  : 0
              }
              adjacents={whitePawnPosAdj}
            />
            {wall}
          </Fragment>
        );
      })}
    </div>
  );
};

const compare = (p: PawnPos, row: number, col: number) => {
  return p.x == row && p.y == col;
};

const isWallHovered = (
  hoveredWall: { pos: PawnPos; wall: Wall } | null,
  row: number,
  col: number,
  horizontal?: boolean,
): boolean => {
  if (!hoveredWall) return false;
  if (horizontal && !hoveredWall.wall.col) return false;
  if (!horizontal && !hoveredWall.wall.row) return false;
  if (hoveredWall.pos.x == row && hoveredWall.pos.y == col) return true;
  if (horizontal && hoveredWall.pos.x == row && hoveredWall.pos.y == col - 1)
    return true;
  return (
    !horizontal && hoveredWall.pos.x == row - 1 && hoveredWall.pos.y == col
  );
};
