"use client";
import { BoardLogic } from "@/components/BoardLogic";

export default function Home() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <BoardLogic />
    </div>
  );
}
