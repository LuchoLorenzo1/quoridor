import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PawnPos, Wall } from "./Board";
import {
  BLACK_START,
  WHITE_START,
  moveToString,
  stringToMove,
} from "./BoardLogic";
import { flushSync } from "react-dom";

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

  const goBack = () => {
    if (activeMove == 0) return;

    setActiveMove((a) => a - 1);
    let move = stringToMove(history[activeMove - 1]);

    if (move.wall != undefined) {
      return undoWallMove(move.pos, move.wall);
    }

    let i = activeMove - 3;
    while (i >= 0 && (history[i].includes("h") || history[i].includes("v")))
      i -= 2;

    let pos: PawnPos;
    if (i < 0) {
      pos = activeMove % 2 == 0 ? BLACK_START : WHITE_START;
    } else {
      let move = stringToMove(history[i]);
      pos = move.pos;
    }

    if (activeMove % 2 == 0) return setBlackPawnPos(pos);
    return setWhitePawnPos(pos);
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
    return;
  };

  const goForward = () => {
    if (activeMove == history.length) return;
    setActiveMove((a) => a + 1);
    let move = stringToMove(history[activeMove]);

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
    } else if (activeMove % 2 == 0) {
      setWhitePawnPos(move.pos);
    } else {
      setBlackPawnPos(move.pos);
    }
  };

  const goFullForward = () => {
    for (let i = activeMove; i <= history.length; i++) {
      goForward();
    }
  };

  const goFullBack = () => {
    for (let i = 0; i < history.length; i++) {
      goBack();
    }
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
    control: { goFullBack, goFullForward, goForward, goBack },
  };
};
