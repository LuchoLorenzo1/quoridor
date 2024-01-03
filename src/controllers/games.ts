import sql from "@/database/db";

export interface Game {
  id: string;
  time_seconds: number;
  history: string;
  white_player_id: string;
  black_player_id: string;
  white_name: string;
  black_name: string;
  white_winner: boolean;
  winning_reason: "play" | "resignation" | "time";
  started_at: Date;
  finished_at: Date;
}

export async function getGamesByUserId(userId: string) {
  try {
    return sql<Game[]>`SELECT
		games.id,
		games.time_seconds,
		games.history,
		games.white_player_id,
		games.black_player_id,
		games.white_winner,
		games.winning_reason,
		games.started_at,
		games.finished_at,
		u1.name as white_name,
		u2.name as black_name
		FROM games
		JOIN users u1
			ON games.white_player_id = u1.id
		JOIN users u2
			ON games.black_player_id = u2.id
		WHERE games.white_player_id = ${userId} OR games.black_player_id = ${userId}
		ORDER BY games.started_at DESC
		LIMIT 20
		`;
  } catch {
    return null;
  }
}

export async function getGameById(gameId: string) {
  try {
    return sql<Game[]>`SELECT
		games.id,
		games.time_seconds,
		games.history,
		games.white_player_id,
		games.black_player_id,
		games.white_winner,
		games.winning_reason,
		games.started_at,
		games.finished_at,
		u1.name as white_name,
		u2.name as black_name
		FROM games
		JOIN users u1
			ON games.white_player_id = u1.id
		JOIN users u2
			ON games.black_player_id = u2.id
		WHERE games.id = ${gameId}
		`;
  } catch {
    return null;
  }
}
