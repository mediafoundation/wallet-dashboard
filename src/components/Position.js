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
  marketData,
  toggleHiddenPosition
}) => {
  const { interest } = getTransfersData({
    transfers,
    token: tokens[index],
    balance,
  })

  let data = [];

  if (tokens[index].description == "sDAI") {
    data = marketData.sparkData
  } else {
    data = marketData.aaveData
  }

  let APY = <Loader className="w-4 inline" />

  if (
    data &&
    data.userReservesData
  ) {
    let asset = data.userReservesData.find(
      (data) =>
        data.underlyingAsset.toLowerCase() === tokens[index].asset.toLowerCase()
    )
    //console.log("asset reserve",asset?.reserve)
    APY = `${(Number(asset?.reserve?.supplyAPY) * 100 || 0).toFixed(2)}% APY`
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
    <div className="w-full flex gap-4 z-20 relative border dark:border-white/10 rounded-xl dark:bg-zinc-950">
      <div className="w-full flex flex-col items-center justify-center p-6  rounded-xl shadow  gap-2 relative">
        <h2 className="text-2xl sm:text-xl md:text-2xl font-bold flex justify-between w-full font-mono">
          <a 
            title={tokens[index].description} 
            className="flex gap-2 items-center" 
            href={`https://etherscan.io/token/${tokens[index].contract}?a=${address}`} 
            target="_blank"
          >
            <Image
              src={tokens[index].spLogo}
              alt={tokens[index].name}
              width={32}
              height={32}
            />
            <span>{toLocaleString(Number(balance.formatted), Number(balance.formatted) > 100000 ? 0 : 2)}</span>
          </a>

          <a 
            title={`View ${tokens[index].name} on Etherscan`}
            className="flex items-center text-xs text-black/70 dark:text-white/70 font-sans" 
            href={`https://etherscan.io/token/${tokens[index].asset}?a=${address}`} 
            target="_blank"
          >
            <span className="text-xs flex gap-2 py-1.5 px-2 border dark:border-white/5 dark:bg-zinc-950 rounded-lg"><Image
              src={tokens[index].logo}
              alt={tokens[index].name}
              width={16}
              height={16}
            /> {tokens[index].name}
            </span>
          </a>
        </h2>
        <div className="border-t dark:border-white/5 text-center font-mono w-full">
          <a className="flex w-full justify-between mt-2" href={link} target="_blank">
            <span>
              <PiChartLineUpDuotone className="inline text-xl" />{" "}
              <span className="font-bold text-green-600 dark:text-green-500">
                {toLocaleString(Number(interest), 2)}
              </span>
            </span> {APY}
          </a>
        </div>
        <div
          className={`w-full border-t py-2 dark:border-white/5 text-center text-sm font-mono ${
            compact && "hidden"
          }`}
        >
          <p className="flex w-full justify-between">
            <span className="text-black/70 dark:text-white/70">
              TOTAL SUPPLIED:
            </span>{" "}
            {toLocaleString(Number(balance.totalSupplyFormatted), 0)}
          </p>
          <p className="flex w-full justify-between">
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
          <p className="flex w-full justify-between">
            <span className="text-black/70 dark:text-white/70">
              AVAILABLE LIQ.:
            </span>{" "}
            {toLocaleString(Number(balance.underlying.formatted), 0)}
          </p>

          <Transfers
            transfers={transfers}
            token={tokens[index]}
            balance={balance}
            index={index}
            toggleHiddenPosition={toggleHiddenPosition}
          />
        </div>
      </div>
    </div>
  )
}

export default Position
