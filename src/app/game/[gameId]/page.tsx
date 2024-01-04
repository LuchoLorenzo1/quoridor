"use client";
import OfflineGame from "@/components/OfflineGame";
import OnlineGame from "@/components/OnlineGame";
import Spinner from "@/components/Spinner";
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

export interface UserData {
  id: string;
  image?: string;
  name: string;
}

export interface GameData {
  history: string[];
  turn: number;
  player: number | null;
  players: string[];
  whiteTimeLeft: number;
  blackTimeLeft: number;
  winner?: number;
  winningReason?: string;
  viewers?: number;
}

export default function Game({ params }: { params: { gameId: number } }) {
  const [loading, setLoading] = useState(true);
  const gameSocket = useRef<Socket | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [whiteUserData, setWhiteUserData] = useState<UserData>({
    id: "",
    name: "white",
  });
  const [blackUserData, setBlackUserData] = useState<UserData>({
    id: "",
    name: "black",
  });

  useEffect(() => {
    const fetchUsers = async (game: GameData) => {
      let f1 = fetch(`/api/users/${game.players[0]}`).then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      });
      let f2 = fetch(`/api/users/${game.players[1]}`).then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      });

      try {
        const data = await Promise.all([f1, f2]);
        setWhiteUserData(data[0]);
        setBlackUserData(data[1]);
        setLoading(false);
      } catch {
        console.log("error fetching users");
      }
    };

    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/games/${params.gameId}`);

        if (res.ok) {
          const data = await res.json();
          let winningReason;
          if (data.winning_reason == "time") {
            winningReason = "on time";
          } else if (data.winning_reason == "resign") {
            winningReason = "by resignation";
          } else {
            winningReason = "";
          }

          let gameData: GameData = {
            history: data.history.split(" "),
            blackTimeLeft: data.time_seconds,
            whiteTimeLeft: data.time_seconds,
            player: null,
            players: [data.white_player_id, data.black_player_id],
            turn: 0,
            winner: data.white_winner ? 0 : 1,
            winningReason,
          };
          setGameData(gameData);
          fetchUsers(gameData);
          return;
        }
      } catch {
        console.log("Error fetching the game");
      }

      console.log(process.env.NEXT_PUBLIC_WS_URL);
      gameSocket.current = io(
        `${process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000"}/game/${
          params.gameId
        }`,
        {
          withCredentials: true,
          autoConnect: true,
        },
      );

      gameSocket.current.once("gameState", async (game: GameData) => {
        setGameData(game);
        fetchUsers(game);
      });

      gameSocket.current.emit("getGame");
    };

    fetchGame();
    return () => {
      gameSocket.current?.disconnect();
    };
  }, [params.gameId]);

  if (loading) return <Spinner />;
  if (gameData == null) return <h1>No game</h1>;
  if (gameSocket.current != null) {
    return (
      <OnlineGame
        gameSocket={gameSocket.current}
        gameData={gameData}
        whitePlayerData={whiteUserData}
        blackPlayerData={blackUserData}
      />
    );
  }

  return (
    <OfflineGame
      initialHistory={gameData.history}
      initialTurn={gameData.turn}
      whitePlayerData={whiteUserData}
      blackPlayerData={blackUserData}
      winner={gameData.winner}
      winningReason={gameData.winningReason}
    />
  );
}
