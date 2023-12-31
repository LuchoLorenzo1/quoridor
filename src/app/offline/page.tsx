"use client";
import OfflineGame from "@/components/OfflineGame";

export default function Offline() {
  return (
    <OfflineGame
      whitePlayerData={{
        id: "offline",
        image: "/default_profile_picture.png",
        name: "white",
      }}
      blackPlayerData={{
        id: "offline",
        image: "/default_profile_picture.png",
        name: "black",
      }}
    />
  );
}
