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

export default Wall;
