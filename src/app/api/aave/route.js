import { fetchMarketData } from "@/utils"
import { NextResponse } from "next/server"

export const fetchCache = "force-no-store"

export async function GET(request) {
  const rpc =
    request.nextUrl.searchParams.get("rpc") || "https://cloudflare-eth.com"

  const user = request.nextUrl.searchParams.get("address") || false
  const market = request.nextUrl.searchParams.get("market") || false

  if (!market) {
    return NextResponse.error("market param is required")
  }

  return NextResponse.json(await fetchMarketData({ user, rpc, market }))
}
