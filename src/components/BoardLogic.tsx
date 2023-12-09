import { createRef, useEffect, useState, RefObject, useRef } from "react";
import Board, { Pawn, PawnPos, Wall } from "./Board";
import { matrix } from "@/utils";
import { useHistory } from "@/hooks/useHistory";
import socket from "@/server";
import GameOverModal from "./GameOverModal";

export const WHITE_START = { x: 0, y: 4 };
export const BLACK_START = { x: 8, y: 4 };

export const BoardLogic = () => {
  const [turn, setTurn] = useState<number | null>(null);

  const player = useRef<number | null>(null);

  const [interactive, setInteractive] = useState<boolean>(true);
  const [whitePawnPos, setWhitePawnPos] = useState<PawnPos>(WHITE_START);
  const [blackPawnPos, setBlackPawnPos] = useState<PawnPos>(BLACK_START);
  const [walls, setWalls] = useState<Wall[][]>(matrix(9, 9));

  const [winner, setWinner] = useState<number | null>(null);

  const {
    history,
    setHistory,
    moveCallbackHistory,
    activeMove,
    setActiveMove,
    control,
  } = useHistory({
    setWhitePawnPos,
    setBlackPawnPos,
    setWalls,
  });

  const [lastMove, setLastMove] = useState<PawnPos | null>(null);
  const [reversed, setReversed] = useState<boolean>(false);

  const pawns: Pawn[] = [
    { pos: whitePawnPos, name: "whitePawn", end: 8, color: "bg-white" },
    { pos: blackPawnPos, name: "blackPawn", end: 0, color: "bg-black" },
  ];

  const movePawn = (pos: PawnPos) => {
    if (activeMove != history.length) return;

    setTurn((t) => {
      if (t == null) return null;
      if (t == 0) {
        setWhitePawnPos((p) => {
          setLastMove(p);
          return pos;
        });
      } else {
        setBlackPawnPos((p) => {
          setLastMove(p);
          return pos;
        });
      }

      let nextTurn = t == 0 ? 1 : 0;

      if (pawns[t].end == pos.x) {
        setWinner(t);
        setInteractive(false);
        return nextTurn;
      }

      setInteractive(player.current == nextTurn);
      return nextTurn;
    });

    moveCallbackHistory(pos);
  };

  const moveWall = (pos: PawnPos, wall: Wall) => {
    if (activeMove != history.length) return;

    setWalls((w) => {
      w[pos.y][pos.x] = wall;
      if (wall.col == 1) {
        w[pos.y][pos.x + 1].col = 2;
      } else {
        w[pos.y + 1][pos.x].row = 2;
      }
      return w;
    });

    setTurn((t) => {
      setInteractive(t == player.current);
      return t == 0 ? 1 : 0;
    });
    setLastMove(null);
    moveCallbackHistory(pos, wall);
  };

  const moveCallback = (pos: PawnPos, wall?: Wall) => {
    if (wall) {
      moveWall(pos, wall);
    } else {
      movePawn(pos);
    }
    socket.emit("move", moveToString(pos, wall));
  };

  const restart = () => {
    setWhitePawnPos(WHITE_START);
    setBlackPawnPos(BLACK_START);
    setTurn(0);
    setWalls(matrix(9, 9));
    setWinner(null);
    setInteractive(true);
    setHistory([]);
    setActiveMove(0);
    setLastMove(null);
  };

  useEffect(() => {
    setInteractive(activeMove == history.length && turn == player.current);
    if (activeMove != history.length) setLastMove(null);
  }, [activeMove]);

  useEffect(() => {
    socket.on("move", (move: string) => {
      control.goForward(Infinity);

      const { pos, wall } = stringToMove(move);

      if (wall) {
        moveWall(pos, wall);
      } else {
        movePawn(pos);
      }
    });

    socket.on("start", (t: number) => {
      console.log("== Start", t, "==");
      player.current = t;
      setInteractive(t == 0);
      setReversed(t == 1);
      setTurn(0);
    });

    socket.emit("start");

    return () => {
      socket.off("start");
      socket.off("move");
    };
  }, []);

  if (player.current == null || turn == null) return <h1>Loading....</h1>;

  return (
    <div className="flex justify-center items-center gap-5 h-full w-full">
      {winner != null && <GameOverModal win={winner == player.current} />}
      <div className="flex flex-col justify-center items-center gap-5">
        <h1>You are playing as: {player.current == 0 ? "White" : "Black"}</h1>
        <h1>Turn: {turn == 0 ? "White" : "Black"}</h1>
        <Board
          turn={turn}
          moveCallback={moveCallback}
          walls={walls}
          pawns={pawns}
          interactive={interactive}
          lastMove={lastMove}
          reversed={reversed}
        />
      </div>
      <div className="flex-row h-[50%] justify-center items-center">
        <GameMenu history={history} activeMove={activeMove} control={control} />
        <button onClick={() => setReversed((r) => !r)}>FlipBoard</button>
      </div>
    </div>
  );
};

const GameMenu = ({
  history,
  activeMove,
  control,
}: {
  history: string[];
  activeMove: number;
  control: ActiveMoveControl;
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
                control={control}
              />
              <MoveButton
                i={2 + i * 2}
                value={m[1]}
                activeMove={activeMove}
                control={control}
              />
            </div>
          );
        })}
      </div>
      <ControlToolBar
        control={control}
        history={history}
        activeMove={activeMove}
      />
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
  history,
  activeMove,
}: {
  control: ActiveMoveControl;
  history: string[];
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
        onClick={() => control.goForward(history.length)}
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
