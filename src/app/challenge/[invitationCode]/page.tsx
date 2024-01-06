/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Rating from "@/components/Rating";
import Spinner from "@/components/Spinner";
import socket from "@/server";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";
import { FaClock } from "react-icons/fa";

export interface Challenge {
  seconds: string;
  color: "random" | "white" | "black";
  rated: "rated" | "casual";
  challenger: {
    id: string;
    name: string;
    image?: string;
    rating: number;
    rd: number;
  };
}

const Challenge = ({ params }: { params: { invitationCode: string } }) => {
  const session = useSession({ required: true });
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!session || session.status != "authenticated") return;

    socket.emit(
      "getChallenge",
      params.invitationCode,
      (challenge: Challenge) => {
        console.log("challenge", challenge);
        setChallenge(challenge);
      },
    );

    socket.on("foundGame", (gameId: string) => {
      router.push(`/game/${gameId}`);
    });

    return () => {
      socket.off("foundGame");
    };
  }, [session]);

  const acceptChallenge = () => {
    socket.emit("acceptChallenge", params.invitationCode);
  };

  const cancelChallenge = () => {
    socket.emit("cancelChallenge", params.invitationCode, () => {
      router.push("/");
    });
  };

  if (!challenge || !session || !session.data) return <Spinner />;

  if (challenge.challenger.id == session.data?.user.id) {
    return (
      <div className="flex text-xl flex-col items-center gap-3 bg-stone-100 p-3 rounded-md border-2 border-stone-400">
        <h1 className="font-bold text-2xl">Challenge created!</h1>
        <Link
          href={`/profile/${challenge.challenger.name}`}
          className="flex flex-col gap-1 items-center"
        >
          <Image
            src={challenge.challenger.image || "/default_profile_picture.png"}
            width={60}
            height={60}
            alt="profile picture"
            className="rounded-md"
          />
          <div>
            {challenge.challenger.name}{" "}
            <Rating
              rating={{
                rating: challenge.challenger.rating,
                rd: +challenge.challenger.rd,
              }}
            />
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {challenge.seconds}s <FaClock />
        </div>
        <div>
          You play <span className="font-bold">{challenge.color}</span>
        </div>
        <div>the challenge is {challenge.rated}</div>
        <button
          className="w-1/2 flex items-center gap-1 p-2 font-bold bg-red-500 rounded text-white"
          onClick={cancelChallenge}
        >
          <IoMdClose />
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex text-xl flex-col items-center gap-3 bg-stone-100 p-3 rounded-md border-2 border-stone-400">
      <h1 className="font-bold text-2xl">You have been challenged!</h1>
      <Link
        href={`/profile/${challenge.challenger.name}`}
        className="flex flex-col gap-1 items-center"
      >
        <Image
          src={challenge.challenger.image || "/default_profile_picture.png"}
          width={60}
          height={60}
          alt="profile picture"
          className="rounded-md"
        />
        <div>
          {challenge.challenger.name}{" "}
          <Rating
            rating={{
              rating: challenge.challenger.rating,
              rd: +challenge.challenger.rd,
            }}
          />
        </div>
      </Link>
      <div className="flex items-center gap-2">
        {challenge.seconds}s <FaClock />
      </div>
      <div>
        You play{" "}
        <span className="font-bold">
          {challenge.color == "white"
            ? "black"
            : challenge.color == "black"
              ? "white"
              : challenge.color}
        </span>
      </div>
      <div>the challenge is {challenge.rated}</div>
      <button
        className="w-1/2 p-2 font-bold bg-green-500 rounded text-white"
        onClick={acceptChallenge}
      >
        Accept
      </button>
    </div>
  );
};

export default Challenge;
