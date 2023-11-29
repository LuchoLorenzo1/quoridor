import { Fragment } from "react";
import WallComponent from "./WallComponent";
import CellComponent from "./CellComponent";
import { CellState } from "@/components/Board";

const CellCol = ({
  col,
  f,
  reversed,
}: {
  col: number;
  f: CellState[];
  reversed: boolean;
}) => {
  return (
    <div className={`flex ${reversed ? "flex-col" : "flex-col-reverse"}`}>
      {f.map((cell, row) => {
        return (
          <Fragment key={`${row}${col}`}>
            <CellComponent
              row={row}
              col={col}
              state={cell}
              reversed={reversed}
            />
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
