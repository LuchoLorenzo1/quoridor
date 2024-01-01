import { CellState } from "@/components/Board";
import PawnComponent from "./PawnComponent";

const columns = "abcdefghi";
const CellComponent = ({
  row,
  col,
  state,
  reversed,
}: {
  row: number;
  col: number;
  state: CellState;
  reversed: boolean;
}) => {
  let cellColor = (row + col) % 2 ? "bg-stone-600" : "bg-stone-200";
  return (
    <div
      key={`${row}-${col}`}
      className={`relative flex overflow-hidden items-center justify-center w-full h-0 pb-[100%] ${cellColor}`}
      data-row={row}
      data-col={col}
      id="cell"
    >
      {state.pawn && <PawnComponent pawn={state.pawn} />}
      {state.highlightCell && (
        <div
          className={`absolute transform translate-y-[47%] w-[110%] h-0 pb-[110%] opacity-40 ${state.highlightCell}`}
          data-row={row}
          data-col={col}
          id="cell"
        />
      )}
      {col == (reversed ? 8 : 0) && (
        <h5
          className={`select-none text-xs lg:text-base absolute top-0 left-0 mx-0.5 font-bold ${
            !((row + col) % 2) ? "text-stone-600" : "text-stone-200"
          }`}
        >
          {row + 1}
        </h5>
      )}
      {row == (reversed ? 8 : 0) && (
        <h5
          className={`select-none text-xs lg:text-base absolute bottom-0 right-0 mx-0.5 font-bold ${
            !((row + col) % 2) ? "text-stone-600" : "text-stone-200"
          }`}
        >
          {columns[col]}
        </h5>
      )}
    </div>
  );
};

export default CellComponent;
