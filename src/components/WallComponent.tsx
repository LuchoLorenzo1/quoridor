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
  if (horizontal && state.row != 0) color = "bg-yellow-500";
  if (!horizontal && state.col != 0) color = "bg-yellow-500";

  if (state.hoveredWall) {
    if (horizontal && state.hoveredWall.toLowerCase() == "h") {
      color = "bg-yellow-300";
    } else if (!horizontal && state.hoveredWall.toLowerCase() == "v") {
      color = "bg-yellow-300";
    }
  }

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

export default Wall;
