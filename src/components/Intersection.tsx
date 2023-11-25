import { CellState } from "../Board";

const Intersection = ({
  row,
  col,
  state,
}: {
  row: number;
  col: number;
  state: CellState;
}) => {
  let color = "bg-white-500";
  if (state.row == 1 || state.col == 1) {
    color = "bg-yellow-500";
  } else if (state.hoveredWall == "v" || state.hoveredWall == "h") {
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

export default Intersection;
