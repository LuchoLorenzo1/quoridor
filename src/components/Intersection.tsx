import { CellState } from "@/components/Board";

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
  if (state.row == 1) {
    if (state.col == 2 || state.col == 0) {
      color =
        state.horizontalWallPlayer == 1 ? "bg-yellow-600" : "bg-yellow-400";
    } else {
      color =
        state.verticallWallPlayer == 1 ? "bg-yellow-600" : "bg-yellow-400";
    }
  } else if (state.col == 1) {
    if (state.row == 2 || state.row == 0) {
      color =
        state.verticallWallPlayer == 1 ? "bg-yellow-600" : "bg-yellow-400";
    } else {
      color =
        state.horizontalWallPlayer == 1 ? "bg-yellow-600" : "bg-yellow-400";
    }
  } else if (state.row == 1 && state.col == 2) {
    color = state.horizontalWallPlayer == 1 ? "bg-yellow-600" : "bg-yellow-400";
  } else if (state.hoveredWall == "v" || state.hoveredWall == "h") {
    color = "bg-yellow-300";
  }

  return (
    <div
      id="intersection"
      className={`${color} z-20 w-full h-0 pb-[100%]`}
      data-row={row}
      data-col={col}
    />
  );
};

export default Intersection;
