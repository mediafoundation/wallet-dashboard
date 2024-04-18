"use client"

import { useEffect, useState } from "react"
import { http, createConfig } from "wagmi"
import { getPublicClient } from "@wagmi/core"
import { mainnet } from "wagmi/chains"
import { isAddress, getAddress, formatEther } from "viem"
import {
  Loader,
  tokens,
  toLocaleString,
  scanTransfers,
  getTransfers as _getTransfers,
  multiBalanceCall,
  fetchMarketData,
} from "../utils"
import Modal from "../components/Modal"
import Position from "../components/Position"
import { RxReload } from "react-icons/rx"
import { RiBarChartBoxLine } from "react-icons/ri"
import { PiGearFineDuotone } from "react-icons/pi"
import { BsArrowsExpand, BsArrowsCollapse } from "react-icons/bs"

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

export default function Home() {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState("")
  const [error, setError] = useState(null)
  const [timer, setTimer] = useState(interval)
  const [rpc, setRpc] = useState("")
  const [transfers, setTransfers] = useState([])
  const [compact, setCompact] = useState(false)
  const [aaveData, setAaveData] = useState({})

  const toggleCompact = () => {
    if (compact) {
      setCompact(false)
      localStorage.removeItem("compact")
    } else {
      setCompact(true)
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

  const getAaveData = async () => {
    const _aaveData = await fetchMarketData({ user: address, rpc })
    setAaveData(_aaveData)
  }

  useEffect(() => {
    if (address) {
      try {
        if (!isAddress(getAddress(address))) {
          setError(`Invalid address ${address}`)
          return
        }
        scanTransfers({ address, publicClient, rpc })
        getBalances()
        getTransfers()
        getAaveData()

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
      getAaveData()
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
              <PiGearFineDuotone className="w-6 h-6 sm:h-7 sm:w-7" />
            </button>
          </Modal>

          <button
            className="flex items-center gap-2 ml-3"
            onClick={toggleCompact}
          >
            {compact ? (
              <BsArrowsExpand className="w-5 h-5 sm:h-6 sm:w-6" />
            ) : (
              <BsArrowsCollapse className="w-5 h-5 sm:h-6 sm:w-6" />
            )}
          </button>
          {loading ? (
            <Loader className="w-5 h-5 sm:h-6 sm:w-6 ml-auto" />
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
            <div className="text-center">
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
                      aaveData={aaveData}
                    />
                  </div>
                ))}
              </div>
              <button
                className="mt-8 text-center relative z-10"
                onClick={() => {
                  getBalances()
                  getTransfers()
                }}
              >
                <span className="flex items-center gap-2">
                  <RxReload className="inline" /> Reload ({timer})
                </span>
              </button>
              <Modal
                title={"AAVE Data"}
                content={
                  <>
                    <div className="max-w-[38rem] max-h-[38rem] overflow-scroll">
                      {aaveData &&
                        aaveData.userReservesData &&
                        JSON.stringify(aaveData.userReservesData)}
                    </div>
                  </>
                }
                onDiscard={() => console.log("Button discard")}
                buttons={[
                  {
                    role: "discard",
                    toClose: true,
                    classes:
                      "bg-zinc-500/20 px-4 py-2 rounded-lg hover:bg-zinc-500/30 transition-all duration-200",
                    label: "Close",
                  },
                ]}
              >
                <button className="mt-8 text-center relative z-10">
                  <span className="flex items-center gap-2">
                    <RiBarChartBoxLine className="inline" /> AAVE Data
                  </span>
                </button>
              </Modal>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
