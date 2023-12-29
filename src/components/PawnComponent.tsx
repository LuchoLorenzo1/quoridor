import { Pawn } from "@/components/Board";

const PawnComponent = ({ pawn }: { pawn: Pawn }) => {
  let color = pawn.color;
  if (pawn.name == "ghostPawn") color += " hover:bg-yellow-500";

  if (pawn.isPlaying) color += " ring ring-yellow-500";

  return (
    <div
      data-row={pawn.pos.x}
      data-col={pawn.pos.y}
      id={pawn.name}
      style={{ viewTransitionName: pawn.name }}
      className={`z-10 mt-[50%] transform translate-y-1/3 w-2/3 h-0 pb-[66.6%] rounded-full ${color}`}
      draggable
    />
  );
};

export default PawnComponent;
