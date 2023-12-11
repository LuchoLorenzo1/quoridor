import Board, { PawnPos, Wall } from "./Board";
import { Game } from "@/hooks/useGame";
import GameMenu from "./GameMenu";

export const BoardLogic = ({
  game: { gameControl, boardSettings, boardState, historyControl },
  player,
  moveCallback,
}: {
  game: Game;
  player: number | null;
  moveCallback: (pos: PawnPos, wall?: Wall) => void;
}) => {
  return (
    <div className="flex justify-center items-center gap-5 h-full w-full">
      <div className="flex flex-col justify-center items-center gap-5">
        {player && (
          <h1>You are playing as: {player == 0 ? "White" : "Black"}</h1>
        )}
        <h1>Turn: {boardState.turn == 0 ? "White" : "Black"}</h1>
        {boardSettings.reversed ? (
          <h1>White walls left: {gameControl.whiteWallsLeft}</h1>
        ) : (
          <h1>Black walls left: {gameControl.blackWallsLeft}</h1>
        )}
        <Board
          boardState={boardState}
          boardSettings={boardSettings}
          moveCallback={moveCallback}
        />
        {boardSettings.reversed ? (
          <h1>Black walls left: {gameControl.blackWallsLeft}</h1>
        ) : (
          <h1>White walls left: {gameControl.whiteWallsLeft}</h1>
        )}
      </div>
      <div className="flex-row h-[50%] justify-center items-center">
        <GameMenu historyControl={historyControl} />
        <button onClick={gameControl.reverseBoard}>FlipBoard</button>
      </div>
    </div>
  );
};
