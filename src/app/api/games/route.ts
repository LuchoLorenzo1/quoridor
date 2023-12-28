import { NextResponse } from "next/server";
import { getGamesByUserId } from "@/controllers/games";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json("", { status: 400 });

  const res = await getGamesByUserId(userId);
  if (res.length == 0) return NextResponse.json([], { status: 404 });

  return NextResponse.json(res, { status: 200 });
}
