import { getGameById } from "@/controllers/games";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { gameId: string } },
) {
  if (!params.gameId) return NextResponse.json("", { status: 400 });

  const res = await getGameById(params.gameId);
  if (res.length == 0) return NextResponse.json("", { status: 404 });

  return NextResponse.json(res[0], { status: 200 });
}
