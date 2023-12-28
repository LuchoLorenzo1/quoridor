import authOptions from "@/app/api/auth/[...nextauth]/auth";
import { getGamesByUserId } from "@/controllers/games";
import { getServerSession } from "next-auth";

interface profileProps {
  params: {
    userId: string;
  };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default async function Profile({ params }: profileProps) {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const games = await getGamesByUserId(params.userId);

  if (!games || games.length == 0) {
    return (
      <div>
        <h1>No games</h1>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Games</h1>
      <table className="table">
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
          {games.map((game) => {
            let d = new Date(game.started_at);
            let c = "min-w-[5rem] py-2 px-4 md:py-3";
            return (
              <tr
                key={game.id}
                className="border-b-2 border-b-zinc-500 text-sm"
              >
                <td align="left" className={`${c} w-40 md:w-64 min-w-[12rem]`}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 bg-white ${
                        game.white_winner
                          ? "border-2 border-lime-600"
                          : "border border-zinc-500"
                      }`}
                    />
                    <h1 className="">{game.white_name}</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 bg-black border-2 ${
                        game.white_winner ? "border-black" : "border-lime-600"
                      }`}
                    />
                    <h1 className="">{game.black_name}</h1>
                  </div>
                </td>
                <td align="center" className={c}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col items-start">
                      <h1 className="font-bold">{game.white_winner ? 1 : 0}</h1>
                      <h1 className="font-bold">{game.white_winner ? 0 : 1}</h1>
                    </div>
                    {(game.white_winner &&
                      game.white_player_id == params.userId) ||
                    (!game.white_winner &&
                      game.black_player_id == params.userId) ? (
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
                  {game.history.split(" ").length}
                </td>
                <td align="right" className={c}>
                  {`${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
