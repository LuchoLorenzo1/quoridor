import { Fragment } from "react";
import WallComponent from "./WallComponent";
import { isWallHovered } from "../utils";
import { PawnPos, Wall } from "../Board";
import Intersection from "./Intersection";

const WallCol = ({
  f,
  col,
  hoveredWall,
}: {
  f: Wall[];
  col: number;
  hoveredWall: { pos: PawnPos; wall: Wall } | null;
}) => {
  if (col >= 8) return;

  return (
    <div key={`walls-${col}`} className="flex flex-col-reverse">
      {f.map((c, row) => {
        let x = row;
        let y = col;

        return (
          <Fragment key={`wall-${row}-${col}`}>
            <WallComponent
              state={c.col}
              row={x}
              col={y}
              hovered={isWallHovered(hoveredWall, x, y)}
            />
            {row < 8 && (
              <Intersection
                row={x}
                col={y}
                state={c}
                hovered={
                  !!hoveredWall &&
                  hoveredWall.pos.x == x &&
                  hoveredWall.pos.y == y
                }
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default WallCol;
