import { db } from '@vercel/postgres';

import { NextResponse } from "next/server";

export async function GET() {

  const client = await db.connect();

  try {
   
    await client.sql`CREATE TABLE IF NOT EXISTS Transactions ( _from varchar(255), _to varchar(255), token varchar(255), _value decimal(50,0), blocknumber decimal(50,0), transactionhash varchar(255) UNIQUE);`;


    await client.sql`CREATE TABLE IF NOT EXISTS Users (
      address varchar(255) UNIQUE,
      firstblock decimal(50,0),
      lastblock decimal(50,0)
    );`;


    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(error);
  }
}