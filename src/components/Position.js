import { PiChartLineUpDuotone } from "react-icons/pi"
import Image from "next/image"
import { Loader, tokens, toLocaleString } from "../utils"
import { getTransfersData } from "@/utils"
import { Transfers } from "./Transfers"
import { formatUnits } from "viem"

export const Position = ({
  balance,
  index,
  address,
  transfers,
  compact,
  aaveData,
}) => {
  const { interest } = getTransfersData({
    transfers,
    token: tokens[index],
    balance,
  })

  let APY = <Loader className="w-4 inline" />
  if (
    aaveData &&
    aaveData.userReservesData &&
    tokens[index].description !== "sDAI"
  ) {
    let asset = aaveData.userReservesData.find(
      (data) =>
        data.underlyingAsset.toLowerCase() === tokens[index].asset.toLowerCase()
    )
    APY = `(${(Number(asset.reserve.supplyAPY) * 100 || 0).toFixed(2)}% APY)`
  }
  if (tokens[index].description == "sDAI") {
    APY = `(13% APY)`
  }

  let link = ""
  if (tokens[index].name === "DAI") {
    link = `https://app.spark.fi/reserve-overview/?underlyingAsset=${tokens[
      index
    ].asset.toLowerCase()}&marketName=proto_spark_v3`
  } else {
    link = `https://app.aave.com/reserve-overview/?underlyingAsset=${tokens[
      index
    ].asset.toLowerCase()}&marketName=proto_mainnet_v3`
  }

  return (
    <div className="w-full flex gap-4 z-20 relative border dark:border-white/10 rounded-xl">
      <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg dark:bg-black/50 gap-2 relative">
        <h2 className="text-2xl font-bold ">
          <a className="flex gap-2 items-center" href={link} target="_blank">
            <Image
              src={tokens[index].logo}
              alt={tokens[index].name}
              width={32}
              height={32}
            />
            <span>{tokens[index].name}</span>
            <span className="text-xs">({tokens[index].description})</span>
          </a>
        </h2>
        <div className="border-t dark:border-white/10  text-center font-mono w-full">
          <a
            className="text-2xl font-bold py-2 block"
            href={`https://etherscan.io/token/${tokens[index].contract}?a=${address}`}
            target="_blank"
          >
            {toLocaleString(Number(balance.formatted), 0)}
          </a>
          <p>
            <PiChartLineUpDuotone className="inline text-xl" />{" "}
            <span className="font-bold text-green-600 dark:text-green-500">
              {toLocaleString(Number(interest), 2)}
            </span>{" "}
            {APY}
          </p>
        </div>
        <div
          className={`border-t py-2 dark:border-white/10 text-center text-sm font-mono ${
            compact && "hidden"
          }`}
        >
          <a target="_blank" href={link} className=" py-2">
            <span className="text-black/70 dark:text-white/70">
              TOTAL SUPPLIED:
            </span>{" "}
            {toLocaleString(Number(balance.totalSupplyFormatted), 0)}
          </a>
          <p>
            <span className="text-black/70 dark:text-white/70">
              TOTAL BORROWED:
            </span>{" "}
            {toLocaleString(
              Number(
                formatUnits(
                  balance.totalSupply - balance.underlying.value,
                  tokens[index].assetDecimals
                )
              ),
              0
            )}
          </p>
          <p>
            <span className="text-black/70 dark:text-white/70">AVAILABLE:</span>{" "}
            {toLocaleString(Number(balance.underlying.formatted), 0)}
          </p>

          <Transfers
            transfers={transfers}
            token={tokens[index]}
            balance={balance}
          />
        </div>
      </div>
    </div>
  )
}

export default Position
