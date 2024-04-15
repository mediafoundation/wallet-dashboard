import { db } from '@vercel/postgres';

import { NextResponse } from "next/server";

export async function GET(request) {

  const address = request.nextUrl.searchParams.get("address");
  const client = await db.connect();

  try {
   
    const transactions = await client.sql`SELECT * FROM Transactions WHERE _from = ${address};`;
    return NextResponse.json( transactions.rows );

  } catch (error) {
    return NextResponse.json({ error });
  }
}