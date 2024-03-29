import { Pawn, PawnPos, Wall } from "@/components/Board";

export const validateWalls = (pawns: Pawn[], walls: Wall[][]): boolean => {
  for (let pawn of pawns) {
    if (!dfs(pawn, walls)) return false;
  }
  return true;
};

export const dfs = (pawn: Pawn, walls: Wall[][]) => {
  const s = (x: number, y: number) => `${x}${y}`;

  const visited = new Set();
  visited.add(s(pawn.pos.x, pawn.pos.y));
  const stack = [pawn.pos];
  let act;

  while (stack.length > 0) {
    act = stack.pop();
    if (!act) break;
    if (act.x == pawn.end) return true;
    getAdjacents(act.x, act.y, walls).forEach(({ x, y }) => {
      if (!visited.has(s(x, y))) {
        visited.add(s(x, y));
        stack.push({ x, y });
      }
    });
  }

  return false;
};

export const getAdjacents = (
  x: number,
  y: number,
  walls: Wall[][],
): PawnPos[] => {
  let adj = [];
  if (x <= 7 && walls[y][x].row == 0) adj.push({ x: x + 1, y });
  if (y <= 7 && walls[y][x].col == 0) adj.push({ x, y: y + 1 });
  if (y >= 1 && walls[y - 1][x].col == 0) adj.push({ x, y: y - 1 });
  if (x >= 1 && walls[y][x - 1].row == 0) adj.push({ x: x - 1, y });
  return adj;
};

export const pickWall = (
  id: string,
  row: number,
  col: number,
  walls: Wall[][],
): { walls: Wall[][]; row: number; col: number } | null => {
  if (id == "horizontal-wall" || id == "intersection") {
    let r = pickHorizontalWall(row, col, walls);
    if (!r) return null;
    row = r.row;
    col = r.col;

    const copy: Wall[][] = structuredClone(walls);
    copy[col][row] = { row: 1, col: walls[col][row].col };
    copy[col + 1][row] = { row: 2, col: walls[col + 1][row].col };
    return { walls: copy, row, col };
  }

  if (id == "vertical-wall") {
    let r = pickVerticalWall(row, col, walls);
    if (!r) return null;
    row = r.row;
    col = r.col;

    const copy = structuredClone(walls);
    copy[col][row] = { row: walls[col][row].row, col: 1 };
    copy[col][row + 1] = { row: walls[col][row + 1].row, col: 2 };
    return { walls: copy, row, col };
  }
  return null;
};

export const pickVerticalWall = (
  row: number,
  col: number,
  walls: Wall[][],
): Wall | null => {
  if (row > 7) row = 7;
  if (col > 7) col = 7;

  if (walls[col][row + 1].col == 1) {
    if (row >= 1 && walls[col][row - 1].row != 1) {
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

export const pickHorizontalWall = (
  row: number,
  col: number,
  walls: Wall[][],
): Wall | null => {
  if (row > 7) row = 7;
  if (col > 7) col = 7;

  if (walls[col + 1][row].row == 1) {
    if (col >= 1 && walls[col - 1][row].col != 1) {
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

export const getPossibleMoves = (
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
          if (pawnPos.y + 1 <= 8 && walls[pawnPos.y][pawnPos.x + 1].col == 0)
            adjss.push({ x: pawnPos.x + x, y: pawnPos.y + 1 });
          if (
            pawnPos.y - 1 >= 0 &&
            walls[pawnPos.y - 1][pawnPos.x + 1].col == 0
          )
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
          if (pawnPos.y + 1 <= 8 && walls[pawnPos.y][pawnPos.x - 1].col == 0)
            adjss.push({ x: pawnPos.x + x, y: pawnPos.y + 1 });
          if (
            pawnPos.y - 1 >= 0 &&
            walls[pawnPos.y - 1][pawnPos.x - 1].col == 0
          )
            adjss.push({ x: pawnPos.x + x, y: pawnPos.y - 1 });
        } else {
          adjss.push({ x: pawnPos.x + x, y: pawnPos.y + y });
        }
      }
      if (y > 0) {
        // Es porque el otro esta para derecha
        if (walls[pawnPos.y + 1][pawnPos.x].col != 0 || pawnPos.y + y > 8) {
          y -= 1;
          if (pawnPos.x + 1 <= 8 && walls[pawnPos.y + 1][pawnPos.x].row == 0)
            adjss.push({ x: pawnPos.x + 1, y: pawnPos.y + y });
          if (
            pawnPos.x - 1 >= 0 &&
            walls[pawnPos.y + 1][pawnPos.x - 1].row == 0
          )
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
          if (pawnPos.x + 1 <= 8 && walls[pawnPos.y - 1][pawnPos.x].row == 0)
            adjss.push({ x: pawnPos.x + 1, y: pawnPos.y + y });
          if (
            pawnPos.x - 1 >= 0 &&
            walls[pawnPos.y - 1][pawnPos.x - 1].row == 0
          )
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

export const matrix = (m: number, n: number): Wall[][] => {
  let _matrix: Wall[][] = [];
  for (let i = 0; i < m; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      let c: Wall = { row: 0, col: 0 };
      row.push(c);
    }
    _matrix.push(row);
  }
  return _matrix;
};

const columns = "abcdefghi";
export const moveToString = (move: PawnPos, wall?: Wall): string => {
  return `${columns[move.y]}${move.x + 1}${
    wall ? (wall.col == 1 ? "v" : "h") : ""
  }`;
};

export const stringToMove = (move: string): { pos: PawnPos; wall?: Wall } => {
  let y = columns.indexOf(move[0]);
  let x = +move[1] - 1;

  let wall;
  if (move[2] == "v") {
    wall = { col: 1, row: 0 };
  } else if (move[2] == "h") {
    wall = { col: 0, row: 1 };
  }

  return {
    pos: { x, y },
    wall,
  };
};
