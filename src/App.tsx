import { useState } from "react";
import Board from "./Board";

export default function App() {
  const [turn, setTurn] = useState<Boolean>(true);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1>Turn: {turn ? "White" : "Black"}</h1>
      <Board setTurn={setTurn} turn={turn} />
    </div>
  );
}
