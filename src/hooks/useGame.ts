import { Pawn, PawnPos, Wall } from "@/components/Board";
import { matrix } from "@/utils";
import { useEffect, useState } from "react";
import { useHistory } from "./useHistory";

export const WHITE_START = { x: 0, y: 4 };
export const BLACK_START = { x: 8, y: 4 };

const useGame = (player: number) => {
  const [turn, setTurn] = useState<number>(0);

  const [whitePawnPos, setWhitePawnPos] = useState<PawnPos>(WHITE_START);
  const [blackPawnPos, setBlackPawnPos] = useState<PawnPos>(BLACK_START);
  const [walls, setWalls] = useState<Wall[][]>(matrix(9, 9));

  const [winner, setWinner] = useState<number | null>(null);

  const {
    history,
    activeMove,
    goBack,
    goForward,
    setHistory,
    setActiveMove,
    moveCallbackHistory,
  } = useHistory({
    setWhitePawnPos,
    setBlackPawnPos,
    setWalls,
  });

  const [lastMove, setLastMove] = useState<PawnPos | null>(null);

  const [interactive, setInteractive] = useState<boolean>(true);
  const [reversed, setReversed] = useState<boolean>(player != 0);

  const pawns: Pawn[] = [
    { pos: whitePawnPos, name: "whitePawn", end: 8, color: "bg-white" },
    { pos: blackPawnPos, name: "blackPawn", end: 0, color: "bg-black" },
  ];

  const movePawn = (pos: PawnPos) => {
    if (activeMove != history.length) return;

    setTurn((t) => {
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

      setInteractive(player == nextTurn);
      return nextTurn;
    });

    moveCallbackHistory(pos);
  };

  const moveWall = (pos: PawnPos, wall: Wall) => {
    if (activeMove != history.length) return;

    setWalls((w) => {
      if (wall.col == 1) {
        w[pos.y][pos.x].col = 1;
        w[pos.y][pos.x + 1].col = 2;
      } else {
        w[pos.y][pos.x].row = 1;
        w[pos.y + 1][pos.x].row = 2;
      }
      return w;
    });

    setTurn((t) => {
      setInteractive(t == player);
      return t == 0 ? 1 : 0;
    });
    setLastMove(null);
    moveCallbackHistory(pos, wall);
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
    setInteractive(activeMove == history.length && turn == player);
    if (activeMove != history.length) setLastMove(null);
  }, [activeMove]);

  const reverseBoard = () => {
    setReversed((r) => !r);
  };

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
    moveWall,
    movePawn,
    reverseBoard,
    restart,
    winner,
  };

  let historyControl = {
    history,
    activeMove,
    goBack,
    goForward,
  };

  return { gameControl, boardState, boardSettings, historyControl };
};

export default useGame;
