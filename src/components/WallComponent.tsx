import { CellState } from "@/components/Board";

const Wall = ({
  row,
  col,
  state,
  horizontal = false,
}: {
  row: number;
  col: number;
  state: CellState;
  horizontal?: boolean;
}) => {
  let color = "bg-white-500";
  if (horizontal && state.row != 0) {
    if (state.horizontalWallPlayer == 1) {
      color = "bg-yellow-600";
    } else {
      color = "bg-yellow-400";
    }
  } else if (!horizontal && state.col != 0) {
    if (state.verticallWallPlayer == 1) {
      color = "bg-yellow-600";
    } else {
      color = "bg-yellow-400";
    }
  }

  if (state.hoveredWall) {
    if (horizontal && state.hoveredWall.toLowerCase() == "h") {
      color = "bg-yellow-300";
    } else if (!horizontal && state.hoveredWall.toLowerCase() == "v") {
      color = "bg-yellow-300";
    }
  }

  const size = horizontal ? "h-0 pb-[33.333%] w-full" : "h-0 pb-[300%] w-full";

  return (
    <div
      className={`${color} ${size} z-20`}
      id={horizontal ? `horizontal-wall` : `vertical-wall`}
      data-row={row}
      data-col={col}
    />
  );
};

export default Wall;
