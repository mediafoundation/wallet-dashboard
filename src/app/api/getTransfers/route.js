import { db } from "@vercel/postgres"
import { http, createConfig } from "wagmi"
import { getPublicClient } from "@wagmi/core"
import { mainnet } from "wagmi/chains"
import { getTransfers, tokens } from "../../../utils"

import { NextResponse } from "next/server"

export async function GET(request) {
  const rpc =
    request.nextUrl.searchParams.get("rpc") || "https://cloudflare-eth.com"

  const fromBlock = BigInt(request.nextUrl.searchParams.get("fromBlock") || 0)
  const toBlock = BigInt(request.nextUrl.searchParams.get("toBlock") || 0)

  const from = request.nextUrl.searchParams.get("from")

  if (!fromBlock || !toBlock || fromBlock > toBlock) {
    return NextResponse.json({ error: "fromBlock and toBlock are required" })
  }
  //require no more than 10k blocks
  if (toBlock - fromBlock > 10000) {
    return NextResponse.json({ error: "max blocks 10k" })
  }

  const config = createConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(rpc),
    },
  })

  const publicClient = getPublicClient(config)

  const client = await db.connect()

  try {
    await client.sql`CREATE TABLE IF NOT EXISTS Transactions ( _from varchar(255), _to varchar(255), token varchar(255), _value decimal(50,0), blocknumber decimal(50,0), transactionhash varchar(255) UNIQUE);`

    await client.sql`CREATE TABLE IF NOT EXISTS Users (
      address varchar(255) UNIQUE,
      firstblock decimal(50,0),
      lastblock decimal(50,0)
    );`

    const user = await client.sql`SELECT * FROM Users WHERE address = ${from};`

    let transfers = []

    //si el usuario todavia no fue agregado a la DB
    if (user.rowCount === 0) {
      await client.sql`INSERT INTO Users (address, firstblock, lastblock)
      VALUES (${from}, ${fromBlock}, ${toBlock});`
    } else {
      //si los bloques ya fueron procesados terminar la ejecucion
      if (
        fromBlock >= user.rows[0].firstblock &&
        toBlock <= user.rows[0].lastblock
      ) {
        const transactions =
          await client.sql`SELECT * FROM Transactions WHERE (_from = ${from} OR _to = ${from}) AND blocknumber >= ${fromBlock} AND blocknumber <= ${toBlock} ORDER BY blocknumber;`
        return NextResponse.json(transactions.rows)
      }
    }

    transfers = await getTransfers({
      publicClient,
      from,
      tokens,
      fromBlock,
      toBlock,
    })

    //insert into transaction table
    for (let i = 0; i < transfers.length; i++) {
      const { args, blockNumber, transactionHash, address } = transfers[i]
      console.log(`Processing transaction ${transactionHash}...`)
      console.log(
        `Transaction ${transactionHash} from ${args.from} to ${args.to} for ${args.value} tokens of ${address} at block ${blockNumber}.`
      )

      // Check if transaction already exists in the database
      const existingTransaction =
        await client.sql`SELECT * FROM Transactions WHERE transactionHash = ${transactionHash};`

      // If transaction hasnt been recorded yet into the db, do it
      if (existingTransaction.rowCount === 0) {
        await client.sql`INSERT INTO Transactions (_from, _to, token, _value, blockNumber, transactionHash) VALUES (${args.from}, ${args.to}, ${address}, ${args.value}, ${blockNumber}, ${transactionHash});`
      } else {
        console.log(
          `Transaction ${transactionHash} already exists in the database.`
        )
      }
    }

    if (user.rowCount > 0) {
      if (fromBlock < user.rows[0].firstblock) {
        await client.sql`UPDATE Users SET firstblock = ${fromBlock} WHERE address = ${from};`
      }
      if (toBlock > user.rows[0].lastblock) {
        await client.sql`UPDATE Users SET lastblock = ${toBlock} WHERE address = ${from};`
      }
    }

    const transactions =
      await client.sql`SELECT * FROM Transactions WHERE (_from = ${from} OR _to = ${from}) AND blocknumber >= ${fromBlock} AND blocknumber <= ${toBlock} ORDER BY blocknumber;`

    return NextResponse.json(transactions.rows)
  } catch (error) {
    return NextResponse.json({ error })
  }
}
