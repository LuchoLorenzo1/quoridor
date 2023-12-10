import { createRef, useEffect, RefObject } from "react";
import Board, { PawnPos, Wall } from "./Board";
import socket from "@/server";
import GameOverModal from "./GameOverModal";
import useGame from "@/hooks/useGame";

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
        <Board
          boardState={boardState}
          boardSettings={boardSettings}
          moveCallback={moveCallback}
        />
      </div>
      <div className="flex-row h-[50%] justify-center items-center">
        <GameMenu historyControl={historyControl} />
        <button onClick={gameControl.reverseBoard}>FlipBoard</button>
      </div>
    </div>
  );
};

const GameMenu = ({
  historyControl: { history, activeMove, goBack, goForward },
}: {
  historyControl: {
    history: string[];
    activeMove: number;
    goBack: (i: number) => void;
    goForward: (i: number) => void;
  };
}) => {
  const pairs = pairElements(history);

  const refs = pairs.reduce<Record<number, RefObject<HTMLDivElement>>>(
    (acc, _, i) => {
      acc[i] = createRef<HTMLDivElement>();
      return acc;
    },
    {},
  );

  useEffect(() => {
    if (!history) return;

    let refIndex = activeMove == 0 ? 0 : Math.floor((activeMove - 1) / 2);
    if (refIndex < 0 || refIndex >= history.length) return;

    let divRef = refs[refIndex].current;
    if (divRef != null)
      divRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [activeMove]);

  if (!history) return;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-52 bg-stone-600 no-scrollbar overflow-y-scroll h-full p-2 text-white mb-2">
        {pairs.map((m, i) => {
          return (
            <div ref={refs[i]} className="gap-2 flex items-center mb-1" key={i}>
              <h2 className="select-none">{i + 1}.</h2>
              <MoveButton
                i={1 + i * 2}
                value={m[0]}
                activeMove={activeMove}
                control={{ goForward, goBack }}
              />
              <MoveButton
                i={2 + i * 2}
                value={m[1]}
                activeMove={activeMove}
                control={{ goForward, goBack }}
              />
            </div>
          );
        })}
      </div>
      <ControlToolBar control={{ goForward, goBack }} activeMove={activeMove} />
    </div>
  );
};

const MoveButton = ({
  value,
  activeMove,
  i,
  control,
}: {
  value: string;
  activeMove: number;
  i: number;
  control: ActiveMoveControl;
}) => {
  return (
    <button
      onClick={() =>
        i > activeMove ? control.goForward(i) : control.goBack(i)
      }
      className={`select-none py-0.5 px-2 rounded-md ${
        activeMove == i ? "text-black bg-white" : "hover:bg-slate-500"
      }`}
    >
      {value}
    </button>
  );
};

interface ActiveMoveControl {
  goForward: (i: number) => void;
  goBack: (i: number) => void;
}

const ControlToolBar = ({
  control,
  activeMove,
}: {
  control: ActiveMoveControl;
  activeMove: number;
}) => {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => control.goBack(0)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {"<<"}
      </button>
      <button
        onClick={() => control.goBack(activeMove - 1)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {"<"}
      </button>
      <button
        onClick={() => control.goForward(activeMove + 1)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {">"}
      </button>
      <button
        onClick={() => control.goForward(Infinity)}
        className="select-none px-3 py-1 bg-green-500 rounded-md"
      >
        {">>"}
      </button>
    </div>
  );
};

const columns = "abcdefghi";
export const moveToString = (move: PawnPos, wall?: Wall): string => {
  return `${columns[move.y]}${move.x + 1}${
    wall ? (wall.col == 1 ? "v" : "h") : ""
  }`;
};

export const stringToMove = (move: string): { pos: PawnPos; wall?: Wall } => {
  let y = columns.indexOf(move[0]);
  let x = +move[1] - 1;

  let wall;
  if (move[2] == "v") {
    wall = { col: 1, row: 0 };
  } else if (move[2] == "h") {
    wall = { col: 0, row: 1 };
  }

  return {
    pos: { x, y },
    wall,
  };
};

const pairElements = (arr: string[]): string[][] => {
  const paired = [];
  for (let i = 0; i < arr.length; i += 2) {
    if (i + 1 < arr.length) {
      paired.push([arr[i], arr[i + 1]]);
    } else {
      paired.push([arr[i]]);
    }
  }
  return paired;
};
