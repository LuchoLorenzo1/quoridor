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

export default Intersection;
