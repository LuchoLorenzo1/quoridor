import authOptions from "@/app/api/auth/[...nextauth]/auth";
import { Game, getGamesByUserId } from "@/controllers/games";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { getUserProfileById, getUserProfileByName } from "@/controllers/users";
import { FaBirthdayCake, FaMedal } from "react-icons/fa";
import { ImTrophy } from "react-icons/im";
import { MONTHS } from "@/constants";
import GamesTable from "@/components/GamesTable";

interface profileProps {
  params: {
    user: string;
  };
}

export default async function Profile({ params }: profileProps) {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const profileDataResult = await (UUID_REGEX.test(params.user)
    ? getUserProfileById(params.user)
    : getUserProfileByName(params.user));
  if (!profileDataResult || profileDataResult.length == 0) {
    return (
      <div>
        <h1>404 User not found</h1>
      </div>
    );
  }
  const profileData = profileDataResult[0];
  const games = await getGamesByUserId(profileData.id);

  return (
    <div className="text-stone-700 flex flex-col flex-grow w-full max-w-xl">
      <div className="bg-stone-200 p-4 flex gap-5 rounded-md mb-4">
        <Image
          src={profileData.image || "/default_profile_picture.png"}
          width={120}
          height={120}
          alt="profile picture"
          className="min-w-[35px] rounded-md"
        />
        <div className="flex flex-col justify-around flex-grow">
          <div>
            <h1 className="text-3xl font-bold">{profileData.name}</h1>
          </div>
          <div className="w-full flex gap-5">
            <div className="flex flex-col font-bold items-center">
              <ImTrophy /> 500
            </div>
            <div className="flex flex-col font-bold items-center">
              <FaMedal /> 503
            </div>
            <div className="flex flex-col font-bold items-center">
              <FaBirthdayCake />
              {`${
                MONTHS[profileData.created_at.getMonth()]
              } ${profileData.created_at.getDate()}, ${profileData.created_at.getFullYear()}`}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-stone-200 p-4 rounded-md">
        <h1 className="text-xl font-bold mb-3">Games</h1>
        {games ? (
          <GamesTable games={games} userId={profileData.id} />
        ) : (
          <p>No games found</p>
        )}
      </div>
    </div>
  );
}
