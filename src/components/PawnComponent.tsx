import { useState } from "react";
import { Pawn } from "../Board";

const PawnComponent = ({ pawn }: { pawn: Pawn }) => {
  const [dragging, setDragging] = useState(false);

  let color = pawn.color;
  if (pawn.name == "ghostPawn") {
    if (dragging) color = "bg-yellow-500";
    color += " hover:bg-yellow-500";
  }

  return (
    <div
      data-row={pawn.pos.x}
      data-col={pawn.pos.y}
      id={pawn.name}
      style={{ viewTransitionName: pawn.name }}
      className={`z-50 w-9 h-9 rounded-full ${color}`}
      draggable
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
    />
  );
};

export default PawnComponent;
