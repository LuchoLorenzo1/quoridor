import { MONTHS } from "@/constants";
import { Game } from "@/controllers/games";
import Link from "next/link";

const GamesTable = ({ games, userId }: { games: Game[]; userId: string }) => {
  return (
    <table>
      <thead>
        <tr className="">
          <th align="left" className="px-4">
            Players
          </th>
          <th align="center" className="px-4">
            Result
          </th>
          <th align="center" className="px-4">
            Moves
          </th>
          <th align="right" className="px-4">
            Date
          </th>
        </tr>
      </thead>
      <tbody>
        {games.map((game: Game) => {
          let d = new Date(game.started_at);
          let c = "relative min-w-[5rem] w-full py-2 px-4 md:py-3";
          return (
            <tr
              key={game.id}
              className="border-b-2 border-b-stone-500 text-sm hover:bg-stone-300"
            >
              <td align="left" className={`${c} w-40 md:w-64 min-w-[12rem]`}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 bg-white ${
                      game.white_winner
                        ? "border-2 border-lime-600"
                        : "border border-stone-500"
                    }`}
                  />
                  <Link
                    className="z-10 font-bold text-stone-800 hover:font-bold"
                    href={`/profile/${game.white_player_id}`}
                  >
                    {game.white_name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 bg-black border-2 ${
                      game.white_winner ? "border-black" : "border-lime-600"
                    }`}
                  />
                  <Link
                    className="z-10 font-bold text-stone-800 hover:font-bold"
                    href={`/profile/${game.black_player_id}`}
                  >
                    {game.black_name}
                  </Link>
                </div>
                <Link
                  className="absolute inset-0 w-full h-full"
                  href={`/game/${game.id}`}
                />
              </td>
              <td align="center" className={c}>
                <Link
                  className="absolute inset-0 w-full h-full"
                  href={`/game/${game.id}`}
                />
                <div className="flex items-center justify-center gap-2">
                  <div className="flex flex-col items-start">
                    <h1 className="font-bold">{game.white_winner ? 1 : 0}</h1>
                    <h1 className="font-bold">{game.white_winner ? 0 : 1}</h1>
                  </div>
                  {(game.white_winner && game.white_player_id == userId) ||
                  (!game.white_winner && game.black_player_id == userId) ? (
                    <div className="flex items-center justify-center text-base font-bold w-4 h-4 bg-lime-500 rounded-sm">
                      +
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-base font-bold w-4 h-4 bg-red-400 rounded-sm">
                      -
                    </div>
                  )}
                </div>
              </td>
              <td align="center" className={c}>
                <Link
                  className="absolute inset-0 w-full h-full"
                  href={`/game/${game.id}`}
                />
                {game.history.split(" ").length}
              </td>
              <td align="right" className={c}>
                <Link
                  className="absolute inset-0 w-full h-full"
                  href={`/game/${game.id}`}
                />
                {`${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default GamesTable;
