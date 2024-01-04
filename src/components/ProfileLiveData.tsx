"use client";
import socket from "@/server";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserData } from "@/app/game/[gameId]/page";
import { BiSolidBinoculars } from "react-icons/bi";
import { LuSwords } from "react-icons/lu";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

interface ProfileLiveData {
  online: boolean;
  gameId?: string;
  opponentId?: string;
}

const ProfileLiveData = ({
  profileData,
  className,
}: {
  profileData: UserData;
  className?: string;
}) => {
  const [playerData, setPlayerData] = useState<ProfileLiveData | null>(null);
  const [opponent, setOpponent] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;
    socket.emit("playerData", profileData.id);
    socket.on("playerData", async (data: ProfileLiveData) => {
      setPlayerData(data);
      if (data.gameId && data.opponentId) {
        console.log("getting opponent data", data.opponentId);
        try {
          const res = await fetch(`/api/users/${data.opponentId}`);
          if (!res.ok) throw new Error();
          const oppData = (await res.json()) as UserData;
          setOpponent(oppData);
        } catch {
          console.log("error getting opponent data");
        }
      }
    });
    return () => {
      socket.off("playerData");
    };
  }, [profileData.id]);

  if (!playerData || !playerData.online) return null;

  if (playerData.gameId && opponent) {
    return (
      <div className={twMerge("bg-stone-200 rounded-md p-4", className)}>
        <h1 className="text-xl font-bold mb-3">Playing Now</h1>
        <div className="flex items-center justify-center gap-3">
          <Link
            href={`/game/${playerData.gameId}`}
            className="flex items-center gap-3 hover:bg-stone-300 p-2 rounded-md"
          >
            <div className="flex flex-col items-center">
              <Image
                src={profileData.image || "/default_profile_picture.png"}
                width={30}
                height={30}
                alt="profile picture"
                className="rounded-md"
              />
              {profileData.name}
            </div>
            VS
            <div className="flex flex-col items-center">
              <Image
                src={opponent.image || "/default_profile_picture.png"}
                width={30}
                height={30}
                alt="profile picture"
                className="rounded-md"
              />
              {opponent.name}
            </div>
          </Link>
          <button
            onClick={() => router.push(`/game/${playerData.gameId}`)}
            className="bg-red-600 rounded text-white hover:bg-red-700 flex items-center gap-1 p-2"
          >
            <BiSolidBinoculars className="" />
            WATCH
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={twMerge("bg-stone-200 rounded-md p-4", className)}>
      <div className="flex items-center gap-3">
        <div className={twMerge("rounded-full w-3 h-3 bg-green-500")} />
        Online
        <button
          onClick={() => {}}
          className="bg-stone-700 rounded text-white hover:bg-stone-600 flex items-center gap-1 p-2"
        >
          <LuSwords />
          Offer a Match
        </button>
      </div>
    </div>
  );
};

export default ProfileLiveData;
