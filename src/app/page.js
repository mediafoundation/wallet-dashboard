"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { http, createConfig } from "wagmi"
import { getPublicClient } from "@wagmi/core"
import { mainnet } from "wagmi/chains"
import { isAddress, getAddress, formatUnits, formatEther, getContract } from "viem"
import {
  Loader,
  tokens,
  toLocaleString,
  CogIcon,
  genesisBlock,
  getTransfers as _getTransfers,
  multiBalanceCall,
  ExpandIcon,
} from "../utils"
import Modal from "../components/Modal"

const interval = 30

const calculateInterest = ({ transfers, balances }) => {
  let interest = 0n
  tokens.forEach((token) => {
    const transfer_from = transfers.filter(
      (transfer) => transfer._from.toLowerCase() == token.contract.toLowerCase()
    )
    const transfer_to = transfers.filter(
      (transfer) => transfer._to.toLowerCase() == token.contract.toLowerCase()
    )

    const deposited = transfer_to.reduce(
      (acc, transfer) => acc + BigInt(transfer._value),
      0n
    )

    const withdrawn = transfer_from.reduce(
      (acc, transfer) => acc + BigInt(transfer._value),
      0n
    )

    const _total = deposited - withdrawn

    let _interest =
      BigInt(
        balances.find((balance) => balance.symbol === token.description).value
      ) - _total

    //give 18 decimals to usdt and usdc so we can add up with DAI that has 18 decimals
    if (token.name === "USDT" || token.name === "USDC") {
      _interest = _interest * 10n ** 12n
    }
    //total += _total,
    interest += _interest
  })
  return toLocaleString(Number(formatEther(interest)), 2)
}

const getTransfersData = ({ transfers, token, balance }) => { 
  const transfer_from = transfers.filter(
    (transfer) => transfer._from.toLowerCase() == token.contract.toLowerCase()
  )
  const transfer_to = transfers.filter(
    (transfer) => transfer._to.toLowerCase() == token.contract.toLowerCase()
  )

  const deposited = transfer_to.reduce(
    (acc, transfer) => acc + BigInt(transfer._value),
    0n
  )

  const withdrawn = transfer_from.reduce(
    (acc, transfer) => acc + BigInt(transfer._value),
    0n
  )

  const total = deposited - withdrawn

  const interest = formatUnits(
    BigInt(balance.value) - total,
    token.assetDecimals
  )

  return { transfer_from, transfer_to, deposited, withdrawn, total, interest }

}

const Transfers = ({ transfers, token, balance }) => {

  const { transfer_from, transfer_to } = getTransfersData({ transfers, token, balance });

  return transfers.length > 0 ? (
    <div className="relative z-50 text-center text-sm font-mono ">
      <Modal
        title={`${token.name} Transactions`}
        content={
          <>
            <div className="text-lg">Deposit transactions</div>
            {transfer_to.map((transfer, index) => (
              <div
                key={index}
                className="flex gap-4 text-black/80 dark:text-white/80"
              >
                <div className="flex gap-2">
                  <span>Amount:</span>
                  <a
                    href={`https://etherscan.io/tx/${transfer.transactionhash}`}
                    target="_blank"
                  >
                    {formatUnits(BigInt(transfer._value), token.assetDecimals)}
                  </a>
                </div>
              </div>
            ))}
            {transfer_to.length == 0 && (
              <div className="dark:text-white/80 ">
                No deposit transactions found
              </div>
            )}
            <div className="text-lg border-t dark:border-white/10 mt-6 pt-6">
              Withdraw transactions
            </div>
            {transfer_from.map((transfer, index) => (
              <div
                key={index}
                className="flex gap-4 text-black/80 dark:text-white/80"
              >
                <div className="flex gap-2">
                  <span>Amount:</span>
                  <a
                    href={`https://etherscan.io/tx/${transfer.transactionhash}`}
                    target="_blank"
                  >
                    {formatUnits(BigInt(transfer._value), token.assetDecimals)}
                  </a>
                </div>
              </div>
            ))}
            {transfer_from.length == 0 && (
              <div className="dark:text-white/80 ">
                No withdraw transactions found
              </div>
            )}
          </>
        }
        onDiscard={() => console.log("Button discard")}
        buttons={[
          {
            role: "discard",
            toClose: true,
            classes:
              "bg-zinc-500/20 px-4 py-2 rounded-lg hover:bg-zinc-500/30 transition-all duration-200",
            label: "Discard",
          },
        ]}
      >
        <button className="text-sm text-black/70 dark:text-white/70 mt-4">
          Show my txs
        </button>
      </Modal>
    </div>
  ) : (
    <Loader className="w-6 h-6" />
  )
}

const Position = ({ balance, index, address, transfers, compact }) => {

  const { interest } = getTransfersData({ transfers, token: tokens[index], balance });

  let link = "";
  if(tokens[index].name === "DAI") {
    link = `https://app.spark.fi/reserve-overview/?underlyingAsset=${tokens[index].asset.toLocaleLowerCase()}&marketName=proto_spark_v3`
  } else {
    link = `https://app.aave.com/reserve-overview/?underlyingAsset=${tokens[index].asset.toLocaleLowerCase()}&marketName=proto_mainnet_v3`
  }
  return (
    <div className="w-full flex gap-4 z-20 relative border dark:border-white/10 rounded-xl">
      <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg dark:bg-black/50 gap-2 relative">
        <h2 className="text-2xl font-bold ">
          <a
            className="flex gap-2 items-center"
            href={link}
            target="_blank"
          >
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
            <span className="text-black/70 dark:text-white/70">EARNINGS:</span>{" "}
            {toLocaleString(Number(interest), 2)}
          </p>
        </div>
        <div className={`border-t py-2 dark:border-white/10 text-center text-sm font-mono ${compact && "hidden"}`}>
          <a 
            target="_blank"
            href={link} className=" py-2"
          >
            <span className="text-black/70 dark:text-white/70">TOTAL SUPPLIED:</span>{" "}
            {toLocaleString(Number(balance.totalSupplyFormatted), 0)}
          </a>
          <p>
            <span className="text-black/70 dark:text-white/70">TOTAL BORROWED:</span>{" "}
            {toLocaleString(Number(formatUnits(balance.totalSupply - balance.underlying.value, tokens[index].assetDecimals)),0)}
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

export default function Home() {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState("")
  const [error, setError] = useState(null)
  const [timer, setTimer] = useState(interval)
  const [rpc, setRpc] = useState("")
  const [transfers, setTransfers] = useState([])
  const [compact, setCompact] = useState(false)


  const toggleCompact = () => {
    if(compact) {
      setCompact(false);
      localStorage.removeItem("compact")
    } else {
      setCompact(true);
      localStorage.setItem("compact", true)
    }
    
  }

  useEffect(() => {
    if (localStorage.getItem("address")) {
      setAddress(localStorage.getItem("address"))
    }
    if (localStorage.getItem("compact")) {
      setCompact(true)
    }
    setRpc(
      localStorage.getItem("rpc")
        ? localStorage.getItem("rpc")
        : "https://cloudflare-eth.com"
    )
  }, [])

  const config = createConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(rpc),
    },
  })

  const publicClient = getPublicClient(config)

  const getTransfers = async () => {
    if (!address) return
    let res = await fetch(`/api/getTransfers/all?address=${address}`)
    let data = await res.json()
    setTransfers(data)
  }

  const scanTransfers = async () => {
    if (!address) return

    // Fetch user data to determine previously scanned blocks
    let res = await fetch(`/api/user?address=${address}`)
    let userData = await res.json()

    // Get the current block number from the public client
    let blockNumber = await publicClient.getBlockNumber()
    blockNumber = Number(blockNumber)

    console.log("Genesis Block (sDAI deploy block)", genesisBlock)
    console.log("Current Block", blockNumber)

    // Variables for the start and end of the block range to scan
    let startBlock, endBlock

    // First, scan from the last scanned block up to the current block, handling in batches if necessary
    if (userData && userData.lastblock) {
      endBlock = blockNumber
      startBlock = Number(userData.lastblock) + 1

      while (startBlock <= endBlock) {
        let nextEndBlock = Math.min(startBlock + 9999, endBlock) // Calculate the next block to end this batch
        await fetchAndLogTransfers(startBlock, nextEndBlock)
        startBlock = nextEndBlock + 1 // Prepare the start of the next batch
      }
    }

    // Second, scan from just below the first scanned block down to the genesis block, handling in batches if needed
    if (userData && userData.firstblock) {
      endBlock = Number(userData.firstblock) - 1
      startBlock = Math.max(genesisBlock, endBlock - 9999)

      while (startBlock > genesisBlock) {
        await fetchAndLogTransfers(startBlock, endBlock)
        endBlock = startBlock - 1
        startBlock = Math.max(genesisBlock, endBlock - 9999)
      }
    }

    // If there are no user data regarding firstblock and lastblock, scan everything from the current block to the genesis block in batches
    if (!(userData && (userData.firstblock || userData.lastblock))) {
      endBlock = blockNumber
      startBlock = Math.max(genesisBlock, endBlock - 9999)

      while (startBlock >= genesisBlock) {
        await fetchAndLogTransfers(startBlock, endBlock)
        endBlock = startBlock - 1
        startBlock = Math.max(genesisBlock, endBlock - 9999)
      }
    }
  }

  async function fetchAndLogTransfers(startBlock, endBlock) {
    console.log(`Fetching transfers from block ${startBlock} to ${endBlock}`)
    let txs = await fetch(
      `/api/getTransfers?from=${address}&rpc=${rpc}&fromBlock=${startBlock}&toBlock=${endBlock}`
    )
    let _data = await txs.json()
    console.log(_data)
    // Sleep between API calls to reduce load
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  const getBalances = async () => {
    if (!address) return
    setLoading(true)
    try {
      let _balances = await multiBalanceCall({
        publicClient,
        address,
        tokens,
      })
      if (_balances) {
        setError(null)
        setBalances(_balances)
        document.title = `${toLocaleString(
          _balances.reduce(
            (acc, balance) => acc + Number(balance.formatted),
            0
          ),
          0
        )} | ${getAddress(address)}`
      } else {
        setError("Unknown error")
      }
    } catch (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const setAddressAndSaveToLocalStorage = (address) => {
    setAddress(address)
    localStorage.setItem("address", address)
  }

  const setRPCAndSaveToLocalStorage = (url) => {
    setRpc(url)
    localStorage.setItem("rpc", url)
  }

  useEffect(() => {
    if (address) {
      try {
        if (!isAddress(getAddress(address))) {
          setError(`Invalid address ${address}`)
          return
        }
        scanTransfers()
        getBalances()
        getTransfers()

        const countdown = setInterval(() => {
          setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : interval))
        }, 1000)

        return () => clearInterval(countdown)
      } catch (e) {
        setError(`Invalid address ${address}`)
      }
    }
  }, [address, rpc])

  useEffect(() => {
    if (timer === 0) {
      getBalances()
      getTransfers()
      setTimer(interval)
    }
  }, [timer])

  return (
    <main className="p-4 lg:p-24 relative">
      <div className="z-10 max-w-3xl text-lg mx-auto mb-4">
        <div className="bg-gradient-to-b from-zinc-200 px-5 py-4 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit w-auto  rounded-xl border bg-gray-200 flex leading-none items-center">
          <Modal
            title={"Settings"}
            content={
              <>
                <p className="dark:text-white/80">RPC Url</p>
                <input
                  type="text"
                  name="rpc"
                  className="mt-4 bg-gradient-to-b from-zinc-200 px-3 py-3 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit rounded-xl border bg-gray-200 flex leading-none w-full"
                  value={rpc}
                  onChange={(e) => setRPCAndSaveToLocalStorage(e.target.value)}
                  placeholder="Enter RPC Url"
                />
                <p className="mt-4 dark:text-white/80">Wallet Address</p>
                <input
                  type="text"
                  name="wallet"
                  className="mt-4 bg-gradient-to-b from-zinc-200 px-3 py-3 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit rounded-xl border bg-gray-200 flex leading-none w-full"
                  value={address}
                  onChange={(e) =>
                    setAddressAndSaveToLocalStorage(e.target.value)
                  }
                  placeholder="Enter your wallet address"
                />
              </>
            }
            onConfirm={() => console.log("Button confirm")}
            onDiscard={() => console.log("Button discard")}
            buttons={[
              {
                role: "discard",
                toClose: true,
                classes:
                  "bg-zinc-500/20 px-4 py-2 rounded-lg hover:bg-zinc-500/30 transition-all duration-200",
                label: "Discard",
              },
              {
                role: "confirm",
                toClose: true,
                classes:
                  "bg-green-800 px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200",
                label: "Confirm",
              },
            ]}
          >
            <button className="flex items-center gap-2">
              <CogIcon className="w-6 h-6 sm:h-7 sm:w-7" />
            </button>
          </Modal>

          <button 
            className="flex items-center gap-2"
            onClick={toggleCompact}
          >
            <ExpandIcon className="w-6 h-6 sm:h-7 sm:w-7" />
          </button>
          {loading ? (
            <Loader className="w-6 h-6 sm:h-7 sm:w-7 ml-auto" />
          ) : (
            <div className="flex gap-3 ml-auto text-base sm:text-lg">
              <span className="font-semibold ml-auto">
                {toLocaleString(
                  balances.reduce(
                    (acc, balance) => acc + Number(balance.formatted),
                    0
                  ),
                  0
                )}
              </span>
              {transfers.length > 0 && balances && (
                <>
                  {" "}
                  &middot;{" "}
                  <span>{calculateInterest({ transfers, balances })}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {address && (
        <div className="w-full">
          {error ? (
            <p className="text-red-500 text-center max-w-2xl">{error}</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {balances.map((balance, index) => (
                  /* balance.value > 0 && */ <div
                    key={index}
                    className="w-full"
                  >
                    <Position
                      balance={balance}
                      index={index}
                      address={address}
                      transfers={transfers}
                      compact={compact}
                    />
                  </div>
                ))}
              </div>
              <button
                className="block w-full mt-8 text-center relative z-10"
                onClick={() => {
                  getBalances()
                  getTransfers()
                }}
              >
                Reload ({timer})
              </button>
            </>
          )}
        </div>
      )}
    </main>
  )
}
