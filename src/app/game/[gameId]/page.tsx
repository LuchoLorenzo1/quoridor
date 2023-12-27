"use client";
import Board, { PawnPos, Wall } from "@/components/Board";
import GameMenu from "@/components/GameMenu";
import GameOverModal from "@/components/GameOverModal";
import Spinner from "@/components/Spinner";
import useGame, { Game } from "@/hooks/useGame";
import useTimer from "@/hooks/useTimer";
import { moveToString, stringToMove } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

interface GameData {
  history: string[];
  turn: number;
  player: number;
  players: string[];
  whiteTimeLeft: number;
  blackTimeLeft: number;
  wallsLeft: {
    white: number;
    black: number;
  };
}

interface UserData {
  id: string;
  image?: string;
  name: string;
}

export default function Game({ params }: { params: { gameId: number } }) {
  const [loading, setLoading] = useState(true);
  const gameSocket = useRef<Socket | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [whiteUserData, setWhiteUserData] = useState<UserData>({
    id: "",
    name: "anonymous",
  });
  const [blackUserData, setBlackUserData] = useState<UserData>({
    id: "",
    name: "anonymous",
  });

  useEffect(() => {
    gameSocket.current = io(`http://localhost:8000/game/${params.gameId}`, {
      withCredentials: true,
      autoConnect: true,
    });

    gameSocket.current.once("gameState", (game: GameData) => {
      setGameData(game);

      let f1 = fetch(`/api/users/${game.players[0]}`).then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      });
      let f2 = fetch(`/api/users/${game.players[1]}`).then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      });

      Promise.all([f1, f2])
        .then((res) => {
          setWhiteUserData(res[0]);
          setBlackUserData(res[1]);
          setLoading(false);
        })
        .catch(() => console.log("error fetching users"));
    });

    if (gameSocket.current.connected) {
      console.log("mando getGame", gameSocket.current?.connected);
      gameSocket.current.emit("getGame");
    } else {
      gameSocket.current.connect();
      gameSocket.current.on("connect", () => {
        console.log("mando getGame", gameSocket.current?.connected);
        gameSocket.current?.emit("getGame");
      });
    }

    return () => {
      gameSocket.current?.disconnect();
    };
  }, []);

  if (loading) return <Spinner />;
  if (gameSocket.current == null || gameData == null) return <h1>No game</h1>;

  return (
    <OnlineGame
      gameSocket={gameSocket.current}
      gameData={gameData}
      whitePlayerData={whiteUserData}
      blackPlayerData={blackUserData}
    />
  );
}

function OnlineGame({
  gameSocket,
  gameData,
  whitePlayerData,
  blackPlayerData,
}: {
  gameSocket: Socket;
  gameData: GameData;
  whitePlayerData: UserData;
  blackPlayerData: UserData;
}) {
  const game = useGame(gameData.player, gameData.wallsLeft, false);
  const whiteTimer = useTimer({
    initialSeconds: gameData.whiteTimeLeft * 10,
    autoStart: gameData.history.length > 0 && gameData.turn == 0,
  });
  const blackTimer = useTimer({
    initialSeconds: gameData.blackTimeLeft * 10,
    autoStart: gameData.turn == 1,
  });
  const abortTimer = useTimer({
    initialSeconds: 10,
    autoStart: false,
    delay: 1000,
  });

  const [gameAborted, setGameAborted] = useState(false);

  const moveCallback = useCallback((pos: PawnPos, wall?: Wall) => {
    if (game.historyControl.activeMove == 0) abortTimer.restart(10, true);

    game.gameControl.moveCallback(pos, wall);
    gameSocket.emit("move", moveToString(pos, wall), (timeLeft: number) => {
      if (gameData.player == 0) {
        whiteTimer.restart(timeLeft * 10, false);
        blackTimer.resume();
      } else {
        blackTimer.restart(timeLeft * 10, false);
        whiteTimer.resume();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    game.gameControl.setTurn(gameData.turn == -1 ? 0 : gameData.turn);
    game.historyControl.setHistory(gameData.history);
    game.historyControl.goForward(Infinity);

    if (gameData.history.length > 1 && gameData.turn != -1) {
      abortTimer.pause();
    }

    if (gameData.player == 1) game.gameControl.reverseBoard();

    gameSocket.on("start", () => {
      abortTimer.restart(10, true);
    });

    let moves = 0;
    gameSocket.on("move", (move: string, timeLeft: number) => {
      game.historyControl.goForward(Infinity);
      if (moves == 0) {
        abortTimer.restart(10, true);
      } else {
        moves++;
      }

      const { pos, wall } = stringToMove(move);

      if (gameData.player == 0) {
        blackTimer.restart(timeLeft * 10, false);
        whiteTimer.resume();
      } else {
        whiteTimer.restart(timeLeft * 10, false);
        blackTimer.resume();
      }

      game.gameControl.moveCallback(pos, wall);
    });

    gameSocket.on("win", (winner: number, reason?: string) => {
      game.gameControl.setWinner({ winner, reason });
      whiteTimer.pause();
      blackTimer.pause();
      abortTimer.pause();
    });

    gameSocket.on("abortGame", () => {
      setGameAborted(true);
      whiteTimer.pause();
      blackTimer.pause();
      abortTimer.pause();
    });

    if (gameSocket.connected) {
      gameSocket.emit("ready");
    } else {
      gameSocket.connect();
      gameSocket.once("connect", () => {
        gameSocket.emit("ready");
      });
    }
  }, []);

  const resign = () => {
    gameSocket.emit("resign");
    whiteTimer.pause();
    blackTimer.pause();
    abortTimer.pause();
  };

  return (
    <>
      <div className="flex justify-center items-center gap-5 h-full w-full">
        {game.gameControl.winner != null && (
          <GameOverModal
            title={
              game.gameControl.winner.winner == gameData.player
                ? "You won!"
                : "You lost!"
            }
            text={game.gameControl.winner.reason}
          />
        )}
        {gameAborted && <GameOverModal title={"Game Aborted"} />}

        <div className="grid grid-cols-10 gap-10 place-items-center w-full max-w-7xl h-full">
          <div
            className={`flex ${
              game.boardSettings.reversed ? "flex-col-reverse" : "flex-col"
            } max-w-fit justify-center items-center w-full gap-3 col-span-10 lg:col-span-8 xl:col-span-7`}
          >
            <GameUserData
              playerData={blackPlayerData}
              timer={blackTimer}
              wallsLeft={game.gameControl.blackWallsLeft}
              color="black"
            />
            <Board
              boardState={game.boardState}
              boardSettings={game.boardSettings}
              moveCallback={moveCallback}
            />
            <GameUserData
              playerData={whitePlayerData}
              timer={whiteTimer}
              wallsLeft={game.gameControl.whiteWallsLeft}
            />
          </div>
          <div className="col-span-full col-start-3 col-end-9 lg:col-span-2 xl:col-span-3 flex flex-col gap-5 w-full h-full items-center">
            <GameMenu historyControl={game.historyControl} />
            <button
              className="w-3/4 rounded px-4 py-2 bg-blue-400 hover:bg-blue-500"
              onClick={game.gameControl.reverseBoard}
            >
              Flip Board
            </button>
            <button
              className="w-3/4 rounded px-4 py-2 bg-red-200 hover:bg-red-500"
              onClick={resign}
            >
              Resign
            </button>
            <h1>
              {!gameAborted &&
              game.historyControl.history.length == 1 &&
              abortTimer.totalSeconds < 6
                ? `aborting in ${abortTimer.totalSeconds}...`
                : ""}
            </h1>
            <h1>
              {!gameAborted &&
              game.historyControl.history.length == 0 &&
              abortTimer.totalSeconds < 6
                ? `aborting in ${abortTimer.totalSeconds}...`
                : ""}
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

const GameUserData = ({
  playerData,
  timer,
  wallsLeft,
  color = "white",
}: {
  playerData: UserData;
  timer: any;
  wallsLeft: number;
  color?: "white" | "black";
}) => {
  return (
    <div className="flex items-center justify-between w-full h-full">
      <div className="flex gap-2">
        <Link href="/profile">
          <Image
            src={playerData?.image || "/default_profile_picture.png"}
            width={45}
            height={45}
            alt="profile picture"
            className="min-w-[45px] rounded-md hover:opacity-50"
          />
        </Link>
        <div className="flex flex-col">
          <h1 className="font-bold">{playerData.name}</h1>
          <div className="flex items-center gap-2">
            {Array(wallsLeft)
              .fill(0)
              .map((_, i) => (
                <span key={i} className="bg-yellow-400 w-2 h-5" />
              ))}
            <h3 className="text-xs font-thin">x({wallsLeft})</h3>
          </div>
        </div>
      </div>
      <div
        className={`flex items-end justify-end rounded flex-grow max-w-[10rem] h-full py-2
			${color == "white" ? "bg-stone-200 text-black" : "bg-stone-600 text-white"}
			${!timer.isRunning && "opacity-50"}`}
      >
        <h1 className="text-left w-1/2 text-2xl font-bold mr-4">
          <span className="">{timer.minutes}</span>:
          <span className="">
            {(timer.seconds.toString().length == 1 ? "0" : "") +
              timer.seconds.toString()}
          </span>
          <span className="text-xl">.{timer.tenths.toString()}</span>
        </h1>
      </div>
    </div>
  );
};
