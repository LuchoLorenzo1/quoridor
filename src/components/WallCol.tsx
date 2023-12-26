import { Fragment } from "react";
import WallComponent from "./WallComponent";
import { CellState } from "@/components/Board";
import Intersection from "./Intersection";

const WallCol = ({
  f,
  col,
  reversed,
  size,
}: {
  f: CellState[];
  col: number;
  reversed: boolean;
  size: string;
}) => {
  if (col >= 8) return;

  return (
    <div
      className={`flex ${reversed ? "flex-col" : "flex-col-reverse"} ${size}`}
    >
      {f.map((cell, row) => {
        return (
          <Fragment key={row}>
            <WallComponent state={cell} row={row} col={col} />
            {row < 8 && <Intersection row={row} col={col} state={cell} />}
          </Fragment>
        );
      })}
    </div>
  );
};

export default WallCol;
