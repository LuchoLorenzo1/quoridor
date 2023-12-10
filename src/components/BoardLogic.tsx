import { useEffect } from "react";
import Board, { PawnPos, Wall } from "./Board";
import socket from "@/server";
import GameOverModal from "./GameOverModal";
import useGame from "@/hooks/useGame";
import GameMenu from "./GameMenu";
import { moveToString, stringToMove } from "@/utils";

export const BoardLogic = ({ player }: { player: number }) => {
  const { gameControl, boardState, boardSettings, historyControl } =
    useGame(player);

  const moveCallback = (pos: PawnPos, wall?: Wall) => {
    if (wall) {
      gameControl.moveWall(pos, wall);
    } else {
      gameControl.movePawn(pos);
    }
    socket.emit("move", moveToString(pos, wall));
  };

  useEffect(() => {
    socket.on("move", (move: string) => {
      historyControl.goForward(Infinity);

      const { pos, wall } = stringToMove(move);

      if (wall) {
        gameControl.moveWall(pos, wall);
      } else {
        gameControl.movePawn(pos);
      }
    });

    return () => {
      socket.off("move");
    };
  }, []);

  return (
    <div className="flex justify-center items-center gap-5 h-full w-full">
      {gameControl.winner != null && (
        <GameOverModal win={gameControl.winner == player} />
      )}
      <div className="flex flex-col justify-center items-center gap-5">
        <h1>You are playing as: {player == 0 ? "White" : "Black"}</h1>
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
