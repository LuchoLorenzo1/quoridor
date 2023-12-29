import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { PawnPos, Wall } from "@/components/Board";
import { BLACK_START, WHITE_START } from "./useGame";
import { moveToString, stringToMove } from "@/utils";

export const useHistory = ({
  setWhitePawnPos,
  setBlackPawnPos,
  setWalls,
  setWhiteWallsLeft,
  setBlackWallsLeft,
  initialHistory = [],
}: {
  setWhitePawnPos: Dispatch<SetStateAction<PawnPos>>;
  setBlackPawnPos: Dispatch<SetStateAction<PawnPos>>;
  setWhiteWallsLeft: Dispatch<SetStateAction<number>>;
  setBlackWallsLeft: Dispatch<SetStateAction<number>>;
  setWalls: Dispatch<SetStateAction<Wall[][]>>;
  initialHistory?: string[];
}) => {
  const [history, _setHistory] = useState<string[]>(initialHistory);
  const [activeMove, _setActiveMove] = useState<number>(0);

  const activeMoveRef = useRef(0);
  const setActiveMove = (data: number) => {
    activeMoveRef.current = data;
    _setActiveMove(data);
  };

  const historyRef = useRef<string[]>(history);
  const setHistory = (data: string[]) => {
    historyRef.current = data;
    _setHistory(data);
  };

  const goBack = (i: number) => {
    if (activeMoveRef.current == 0) return;
    if (i >= activeMoveRef.current) return;

    let wPos;
    let bPos;

    for (let a = activeMoveRef.current; a > i; a--) {
      let move = stringToMove(historyRef.current[a - 1]);

      if (move.wall != undefined) {
        undoWallMove(move.pos, move.wall);
        if (a % 2 == 0) {
          setBlackWallsLeft((w) => w + 1);
        } else {
          setWhiteWallsLeft((w) => w + 1);
        }
        continue;
      }

      let x = a - 3;
      while (
        x >= 0 &&
        (historyRef.current[x][2] == "h" || historyRef.current[x][2] == "v")
      )
        x -= 2;

      let pos: PawnPos;
      if (x < 0) {
        pos = a % 2 == 0 ? BLACK_START : WHITE_START;
      } else {
        let move = stringToMove(historyRef.current[x]);
        pos = move.pos;
      }

      if (a % 2 == 0) {
        bPos = pos;
      } else {
        wPos = pos;
      }
    }

    setActiveMove(i);
    if (bPos) setBlackPawnPos(bPos);
    if (wPos) setWhitePawnPos(wPos);
  };

  const undoWallMove = (pos: PawnPos, wall: Wall) => {
    setWalls((w) => {
      if (wall?.col == 1) {
        w[pos.y][pos.x] = { col: 0, row: w[pos.y][pos.x].row };
        w[pos.y][pos.x + 1] = { col: 0, row: w[pos.y][pos.x + 1].row };
      } else if (wall?.row == 1) {
        w[pos.y][pos.x] = { row: 0, col: w[pos.y][pos.x].col };
        w[pos.y + 1][pos.x] = { row: 0, col: w[pos.y + 1][pos.x].col };
      }
      return w;
    });
  };

  const goForward = (i: number) => {
    if (i == Infinity) i = historyRef.current.length;
    if (activeMoveRef.current == historyRef.current.length) return;
    if (i <= activeMoveRef.current) return;

    let wPos;
    let bPos;

    for (let a = activeMoveRef.current; a < i; a++) {
      let move = stringToMove(historyRef.current[a]);

      if (move.wall) {
        setWalls((w) => {
          if (move.wall?.col == 1) {
            w[move.pos.y][move.pos.x] = {
              col: 1,
              row: w[move.pos.y][move.pos.x].row,
            };
            w[move.pos.y][move.pos.x + 1] = {
              col: 2,
              row: w[move.pos.y][move.pos.x + 1].row,
            };
          } else {
            w[move.pos.y][move.pos.x] = {
              row: 1,
              col: w[move.pos.y][move.pos.x].col,
            };
            w[move.pos.y + 1][move.pos.x] = {
              row: 2,
              col: w[move.pos.y + 1][move.pos.x].col,
            };
          }
          return w;
        });
        if (a % 2 == 0) {
          setWhiteWallsLeft((w) => w - 1);
        } else {
          setBlackWallsLeft((w) => w - 1);
        }
      } else if (a % 2 == 0) {
        wPos = move.pos;
      } else {
        bPos = move.pos;
      }
    }

    setActiveMove(i);
    if (bPos) setBlackPawnPos(bPos);
    if (wPos) setWhitePawnPos(wPos);
  };

  const moveCallbackHistory = (move: PawnPos, wall?: Wall) => {
    setHistory([...historyRef.current, moveToString(move, wall)]);
    setActiveMove(activeMoveRef.current + 1);
  };

  let keydown = false;
  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    if (keydown) return;
    keydown = true;
    setTimeout(() => (keydown = false), 50);

    if (e.key == "ArrowLeft") {
      goBack(activeMoveRef.current - 1);
    } else if (e.key == "ArrowRight") {
      goForward(activeMoveRef.current + 1);
    } else if (e.key == "ArrowUp") {
      goForward(historyRef.current.length);
    } else if (e.key == "ArrowDown") {
      goBack(0);
    }
  };

  useEffect(() => {
    goForward(Infinity);
    addEventListener("keydown", handleKeyDown);
    return () => removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    history,
    activeMove,
    setActiveMove,
    setHistory,
    moveCallbackHistory,
    goForward,
    goBack,
  };
};
