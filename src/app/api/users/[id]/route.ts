import sql from "@/database/db";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: number } }) {
  if (!params.id) return NextResponse.json({}, { status: 400 });

  let res = await sql`SELECT
	name, image, id
	FROM users
	WHERE id = ${params.id}`;

  if (res.length == 0) return NextResponse.json({}, { status: 404 });

  return NextResponse.json(res[0], { status: 200 });
}
