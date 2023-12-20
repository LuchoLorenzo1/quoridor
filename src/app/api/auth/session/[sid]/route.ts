import sql from "@/database/db";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { sid: number } }) {
  if (!params.sid) return NextResponse.json({}, { status: 400 });

  let res = await sql`SELECT
	users.name, users.email, users.id
		FROM users
	INNER JOIN auth_sessions
		ON users.id = auth_sessions.user_id
	WHERE auth_sessions.session_token = ${params.sid}`;

  if (res.length == 0) return NextResponse.json({}, { status: 404 });

  return NextResponse.json(res[0], { status: 200 });
}
