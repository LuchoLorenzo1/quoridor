import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PawnPos, Wall } from "./Board";
import {
  BLACK_START,
  WHITE_START,
  moveToString,
  stringToMove,
} from "./BoardLogic";

export const useHistory = ({
  setWhitePawnPos,
  setBlackPawnPos,
  setWalls,
}: {
  setWhitePawnPos: Dispatch<SetStateAction<PawnPos>>;
  setBlackPawnPos: Dispatch<SetStateAction<PawnPos>>;
  setWalls: Dispatch<SetStateAction<Wall[][]>>;
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const [activeMove, setActiveMove] = useState<number>(0);

  const goBack = (i: number) => {
    if (activeMove == 0) return;
    if (i >= activeMove) return;

    let wPos;
    let bPos;

    for (let a = activeMove; a > i; a--) {
      let move = stringToMove(history[a - 1]);

      if (move.wall != undefined) {
        undoWallMove(move.pos, move.wall);
        continue;
      }

      let x = a - 3;
      while (x >= 0 && (history[x].includes("h") || history[x].includes("v")))
        x -= 2;

      let pos: PawnPos;
      if (x < 0) {
        pos = a % 2 == 0 ? BLACK_START : WHITE_START;
      } else {
        let move = stringToMove(history[x]);
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
    if (activeMove == history.length) return;
    if (i <= activeMove) return;

    let wPos;
    let bPos;

    for (let a = activeMove; a < i; a++) {
      let move = stringToMove(history[a]);

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
    setHistory((h) => [...h, moveToString(move, wall)]);
    setActiveMove((a) => a + 1);
  };

  // useEffect(() => {
  // 	let keydown = false;
  // 	addEventListener("keyup", (_) => keydown = false);
  // 	addEventListener("keydown", (e) => {
  // 		if (keydown) return;
  // 		keydown = true;
  // 		if (e.key == "ArrowLeft") {
  // 			goBack();
  // 		} else if (e.key == "ArrowRight") {
  // 			goForward();
  // 		}
  // 	});
  // }, []);

  return {
    history,
    activeMove,
    setHistory,
    moveCallbackHistory,
    control: { goForward, goBack },
  };
};
