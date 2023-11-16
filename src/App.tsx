import { Fragment, MouseEvent, useState } from "react";

function App() {
  const [walls, setWalls] = useState(matrix(9, 9));
  const [whitePawnPos, setWhitePawnPos] = useState({
    x: 8,
    y: 4,
  });

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const ids = [
      "pawn",
      "horizontal-wall",
      "vertical-wall",
      "intersection",
      "cell",
    ];

    if (!ids.includes(target.id)) {
      return;
    }

    let row = +(target.getAttribute("data-row") || 1);
    let col = +(target.getAttribute("data-col") || 0);

    if (target.id == "pawn") {
      return;
    }

    if (target.id == "horizontal-wall" || target.id == "intersection") {
      if (row > 7) row = 7;
      if (col > 7) col = 7;

      if (walls[col + 1][row].row == 1) {
        if (col >= 1) {
          col -= 1;
        } else {
          return;
        }
      }

      console.log(walls[col][row]);
      if (walls[col][row].row != 0) {
        return;
      }

      if (walls[col][row].col == 1) {
        if (
          col < 1 ||
          walls[col - 1][row].col == 1 ||
          walls[col - 1][row].row != 0
        )
          return;
        col -= 1;
      }

      const copy = [...walls];
      copy[col][row] = { row: 1, col: walls[col][row].col };
      copy[col + 1][row] = { row: 2, col: walls[col + 1][row].col };
      setWalls(copy);
      return;
    }

    if (target.id == "vertical-wall") {
      if (row > 7) row = 7;
      if (col > 7) col = 7;

      console.log(walls[col][row]);
      if (walls[col][row + 1].col == 1) {
        if (row >= 1) {
          row -= 1;
        } else {
          return;
        }
      }

      console.log(walls[col][row]);
      if (walls[col][row].row == 1 || walls[col][row].col != 0) return;

      const copy = [...walls];
      copy[col][row] = { row: walls[col][row].row, col: 1 };
      copy[col][row + 1] = { row: walls[col][row + 1].row, col: 2 };
      setWalls(copy);
      return;
    }

    console.log(row, col);

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setWhitePawnPos({ x: row, y: col });
      });
    }
  };

  return (
    <div
      onClick={(e) => handleClick(e)}
      className="w-screen h-screen flex justify-center items-center bg-red-100"
    >
      {walls.map((f, col) => {
        return (
          <Fragment key={`col-${col}`}>
            <div className="flex flex-col-reverse">
              {f.map((c, row) => {
                return (
                  <Fragment key={`cell-${row}-${col}`}>
                    <Cell
                      row={row}
                      col={col}
                      state={
                        whitePawnPos.x == row && whitePawnPos.y == col ? 1 : 0
                      }
                    />
                    {row < 8 ? (
                      <Wall
                        state={c.row}
                        row={row}
                        col={col}
                        horizontal={true}
                      />
                    ) : (
                      ""
                    )}
                  </Fragment>
                );
              })}
            </div>
            {col < 8 && (
              <div key={`walls-${col}`} className="flex flex-col-reverse">
                {f.map((c, row) => {
                  return (
                    <Fragment key={`wall-${row}-${col}`}>
                      <Wall state={c.col} row={row} col={col} />
                      {row < 8 ? (
                        <Intersection row={row} col={col} state={c} />
                      ) : (
                        ""
                      )}
                    </Fragment>
                  );
                })}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

const Cell = ({
  row,
  col,
  state,
}: {
  row: number;
  col: number;
  state: number;
}) => {
  const isEven = !((row + col) % 2);

  return (
    <div
      key={`${row}-${col}`}
      className={`flex items-center justify-center w-12 h-12 ${
        isEven ? "bg-slate-300" : "bg-slate-600"
      }`}
      data-row={row}
      data-col={col}
      id="cell"
    >
      {state == 1 && (
        <div id="pawn" className="w-9 h-9 bg-blue-600 rounded-full" />
      )}
    </div>
  );
};

const Wall = ({
  state,
  row,
  col,
  horizontal = false,
}: {
  state: number;
  row: number;
  col: number;
  horizontal?: boolean;
}) => {
  const color = state == 0 ? "bg-white-500" : "bg-yellow-500";
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
}: {
  row: number;
  col: number;
  state: { row: number; col: number };
}) => {
  return (
    <div
      id="intersection"
      className={`${
        state.row == 1 || state.col == 1 ? "bg-yellow-500" : "bg-white-500"
      } w-4 h-4`}
      data-row={row}
      data-col={col}
    />
  );
};

function matrix(m: number, n: number) {
  return Array.from(
    {
      length: m,
    },
    () => new Array(n).fill({ row: 0, col: 0 }),
  );
}

export default App;
