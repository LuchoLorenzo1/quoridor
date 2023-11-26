import { useState } from "react";
import { Pawn } from "../Board";

const PawnComponent = ({ pawn }: { pawn: Pawn }) => {
  let color = pawn.color;
  if (pawn.name == "ghostPawn") {
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
    />
  );
};

export default PawnComponent;
