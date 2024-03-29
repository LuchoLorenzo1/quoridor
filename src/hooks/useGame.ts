import { Pawn, PawnPos, Wall } from "@/components/Board";
import { matrix } from "@/utils";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useHistory } from "./useHistory";

export const WHITE_START = { x: 0, y: 4 };
export const BLACK_START = { x: 8, y: 4 };

type FinishedGameState = {
  winner: number;
  reason?: string;
};

export type GameController = {
  gameControl: {
    moveCallback: (pos: PawnPos, wall?: Wall) => number;
    reverseBoard: () => void;
    setInteractive: Dispatch<SetStateAction<boolean>>;
    restart: () => void;
    setWinner: Dispatch<SetStateAction<FinishedGameState | null>>;
    setTurn: (t: number) => void;
    winner: FinishedGameState | null;
    whiteWallsLeft: number;
    blackWallsLeft: number;
  };
  boardState: {
    turn: number;
    walls: Wall[][];
    pawns: Pawn[];
    lastMove: PawnPos[];
  };
  boardSettings: {
    reversed: boolean;
    interactive: boolean;
  };
  historyControl: {
    history: string[];
    activeMove: number;
    goBack: (i: number) => void;
    setHistory: (history: string[]) => void;
    goForward: (i: number) => void;
  };
};

const useGame = ({
  player,
  initialHistory,
  initialTurn,
  defineWinner = true,
}: {
  player: number | null;
  initialHistory?: string[];
  initialTurn?: number;
  defineWinner?: boolean;
}): GameController => {
  const [turn, _setTurn] = useState<number>(initialTurn != 1 ? 0 : 1);
  const turnRef = useRef(turn);
  const setTurn = (t: number) => {
    turnRef.current = t;
    _setTurn(t);
  };

  const [whitePawnPos, setWhitePawnPos] = useState<PawnPos>(WHITE_START);
  const [blackPawnPos, setBlackPawnPos] = useState<PawnPos>(BLACK_START);

  const [whiteWallsLeft, setWhiteWallsLeft] = useState<number>(10);
  const [blackWallsLeft, setBlackWallsLeft] = useState<number>(10);
  const wallsLeft = useRef({ white: whiteWallsLeft, black: blackWallsLeft });

  const incrementWallsLeft = (w: number, color: "white" | "black") => {
    if (color == "white") {
      setWhiteWallsLeft(wallsLeft.current.white + w);
      wallsLeft.current.white += w;
    } else {
      setBlackWallsLeft(wallsLeft.current.black + w);
      wallsLeft.current.black += w;
    }
  };

  const [walls, setWalls] = useState<Wall[][]>(matrix(9, 9));
  const [winner, setWinner] = useState<FinishedGameState | null>(null);

  const {
    history,
    activeMove,
    lastMove,
    goBack,
    goForward,
    setHistory,
    setActiveMove,
    moveCallbackHistory,
  } = useHistory({
    setWhitePawnPos,
    setBlackPawnPos,
    incrementWallsLeft,
    setWalls,
    initialHistory,
  });

  const [interactive, setInteractive] = useState<boolean>(true);
  const [reversed, setReversed] = useState<boolean>(false);

  const pawns: Pawn[] = [
    {
      pos: whitePawnPos,
      name: "whitePawn",
      end: 8,
      color: "bg-white",
      isPlaying: turn == 0 && activeMove == history.length,
    },
    {
      pos: blackPawnPos,
      name: "blackPawn",
      end: 0,
      color: "bg-black",
      isPlaying: turn == 1 && activeMove == history.length,
    },
  ];

  const movePawn = (pos: PawnPos) => {
    if (activeMove != history.length) return false;

    if (turnRef.current == 0) {
      setWhitePawnPos(pos);
    } else {
      setBlackPawnPos(pos);
    }

    if (pawns[turnRef.current].end == pos.x) {
      if (defineWinner) {
        new Audio("/Notify.mp3").play();
        setWinner({ winner: turnRef.current });
        setInteractive(false);
      }
    }

    let nextTurn = turnRef.current == 0 ? 1 : 0;

    setInteractive(player == null || player == nextTurn);
    moveCallbackHistory(pos);
    setTurn(nextTurn);
    return true;
  };

  const moveWall = (pos: PawnPos, wall: Wall): boolean => {
    if (activeMove != history.length) return false;
    if (turnRef.current == 0 && wallsLeft.current.white <= 0) return false;
    if (turnRef.current == 1 && wallsLeft.current.black <= 0) return false;
    let t = turnRef.current;
    setWalls((w) => {
      if (wall.col == 1) {
        w[pos.y][pos.x].col = 1;
        w[pos.y][pos.x + 1].col = 2;
        w[pos.y][pos.x].verticallWallPlayer = t;
        w[pos.y][pos.x + 1].verticallWallPlayer = t;
      } else {
        w[pos.y][pos.x].row = 1;
        w[pos.y + 1][pos.x].row = 2;
        w[pos.y][pos.x].horizontalWallPlayer = t;
        w[pos.y + 1][pos.x].horizontalWallPlayer = t;
      }
      return w;
    });

    setInteractive(player == null || turnRef.current == player);

    if (turnRef.current == 0) {
      setWhiteWallsLeft((w) => {
        wallsLeft.current.white = w - 1;
        return w - 1;
      });
    } else {
      setBlackWallsLeft((w) => {
        wallsLeft.current.black = w - 1;
        return w - 1;
      });
    }

    setTurn(turnRef.current == 0 ? 1 : 0);

    moveCallbackHistory(pos, wall);
    return true;
  };

  const moveCallback = (pos: PawnPos, wall?: Wall) => {
    if (wall) {
      moveWall(pos, wall);
    } else {
      movePawn(pos);
    }
    return turnRef.current;
  };

  const restart = () => {
    setWhitePawnPos(WHITE_START);
    setBlackPawnPos(BLACK_START);
    setWhiteWallsLeft(10);
    setBlackWallsLeft(10);
    wallsLeft.current = { white: 10, black: 10 };

    setTurn(0);
    turnRef.current = 0;

    setWalls(matrix(9, 9));
    setWinner(null);
    setInteractive(true);
    setHistory([]);
    setActiveMove(0);
  };

  useEffect(() => {
    setInteractive(
      !winner &&
        activeMove == history.length &&
        (turnRef.current == player || player == null),
    );

    if (activeMove > 0) {
      if (
        history[activeMove - 1][2] == "h" ||
        history[activeMove - 1][2] == "v"
      ) {
        new Audio("/MoveWall.mp3").play();
      } else {
        new Audio("/MovePawn.mp3").play();
      }
    }

    // if (activeMove != history.length) setLastMove(null);
  }, [activeMove]);

  const reverseBoard = () => setReversed((r) => !r);

  let boardSettings = {
    reversed,
    interactive,
  };

  let boardState = {
    turn,
    walls,
    pawns,
    lastMove,
  };

  let gameControl = {
    moveCallback,
    reverseBoard,
    setInteractive,
    restart,
    setWinner,
    setTurn,
    winner,
    whiteWallsLeft,
    blackWallsLeft,
  };

  let historyControl = {
    history,
    activeMove,
    setHistory,
    goBack,
    goForward,
  };

  return { gameControl, boardState, boardSettings, historyControl };
};

export default useGame;
