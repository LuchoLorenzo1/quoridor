import { Fragment } from "react";
import { Pawn, PawnPos, Wall } from "../Board";
import { isWallHovered } from "../utils";
import WallComponent from "./WallComponent";
import CellComponent from "./CellComponent";

const CellCol = ({
  f,
  col,
  hoveredWall,
  pawns,
  currPawnPosAdj,
}: {
  f: Wall[];
  col: number;
  hoveredWall: { pos: PawnPos; wall: Wall } | null;
  pawns: Pawn[];
  currPawnPosAdj: PawnPos[];
}) => {
  return (
    <div className={"flex flex-col-reverse"}>
      {f.map((c, row) => {
        let x = row;
        let y = col;

        let wall;
        if (row < 8)
          wall = (
            <WallComponent
              state={c.row}
              hovered={isWallHovered(hoveredWall, x, y, true)}
              row={x}
              col={y}
              horizontal={true}
            />
          );

        let ghostPawn: Pawn | null = null;
        for (let i of currPawnPosAdj) {
          if (i.x == x && i.y == y) {
            ghostPawn = {
              pos: { x, y },
              name: "ghostPawn",
              color: "bg-neutral-400",
            };
            break;
          }
        }

        let pawn: Pawn | null = null;
        for (let i of pawns) {
          if (i.pos.x == x && i.pos.y == y) {
            pawn = i;
          }
        }

        return (
          <Fragment key={`cell-${row}-${col}`}>
            <CellComponent row={x} col={y} pawn={pawn || ghostPawn} />
            {wall}
          </Fragment>
        );
      })}
    </div>
  );
};

export default CellCol;
