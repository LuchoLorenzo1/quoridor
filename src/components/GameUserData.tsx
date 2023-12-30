import Link from "next/link";
import Image from "next/image";
import { UserData } from "@/app/game/[gameId]/page";

const GameUserData = ({
  playerData,
  wallsLeft,
  timer,
  color = "white",
}: {
  playerData: UserData;
  wallsLeft: number;
  timer?: any;
  color?: "white" | "black";
}) => {
  return (
    <div className="flex items-center justify-between w-full h-full">
      <div className="flex gap-2">
        {playerData.id ? (
          <Link href={`/profile/${playerData.id}`}>
            {" "}
            <Avatar src={playerData.image} />{" "}
          </Link>
        ) : (
          <Avatar src={playerData.image} />
        )}
        <div className="flex flex-col">
          <h1 className="font-bold">{playerData.name}</h1>
          <div className="flex items-center gap-2">
            {Array(wallsLeft <= 0 ? 0 : wallsLeft)
              .fill(0)
              .map((_, i) => (
                <span
                  key={i}
                  className={`${
                    color == "white" ? "bg-yellow-400" : "bg-yellow-600"
                  }  w-2 h-5`}
                />
              ))}
            <h3 className="text-xs font-thin">x({wallsLeft})</h3>
          </div>
        </div>
      </div>
      {timer && (
        <div
          className={`flex items-end justify-end rounded flex-grow max-w-[10rem] h-full py-2
				${color == "white" && !timer.lowTime ? "bg-stone-200 text-black" : ""}
				${color == "black" && !timer.lowTime ? "bg-stone-600 text-white" : ""}
				${timer.lowTime ? "bg-red-800 text-white" : ""}
				${timer.isRunning == false ? "opacity-50" : ""}
				`}
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
      )}
    </div>
  );
};

export default GameUserData;

const Avatar = ({ src }: { src?: string }) => {
  return (
    <Image
      src={src || "/default_profile_picture.png"}
      width={45}
      height={45}
      alt="profile picture"
      className="min-w-[45px] rounded-md hover:opacity-50"
    />
  );
};
