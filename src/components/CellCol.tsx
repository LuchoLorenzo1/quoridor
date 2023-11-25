import { Fragment } from "react";
import WallComponent from "./WallComponent";
import CellComponent from "./CellComponent";
import { CellState } from "../Board";

const CellCol = ({ col, f }: { col: number; f: CellState[] }) => {
  return (
    <div className="flex flex-col-reverse">
      {f.map((cell, row) => {
        return (
          <Fragment key={`${row}${col}`}>
            <CellComponent row={row} col={col} pawn={cell.pawn} />
            {row < 8 && (
              <WallComponent
                state={cell}
                row={row}
                col={col}
                horizontal={true}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default CellCol;
