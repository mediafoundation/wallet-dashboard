import { db } from '@vercel/postgres';

import { NextResponse } from "next/server";

export async function GET(request) {

  const address = request.nextUrl.searchParams.get("address");
  const client = await db.connect();

  try {
    const user = await client.sql`SELECT * FROM Users WHERE address = ${address};`;
    return NextResponse.json(user.rows[0]);

  } catch (error) {
    return NextResponse.json(error);
  }
}