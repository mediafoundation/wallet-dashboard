"use client"

import { useEffect, useState, useMemo } from "react"
import { http, createConfig } from "wagmi"
import { getPublicClient } from "@wagmi/core"
import { mainnet } from "wagmi/chains"
import { isAddress, getAddress } from "viem"
import {
  Loader,
  tokens,
  toLocaleString,
  scanTransfers,
  getTransfers as _getTransfers,
  multiBalanceCall,
  fetchMarketData,
  calculateInterest,
} from "../utils"
import { Modal } from "@/components/Modal"
import { Position } from "@/components/Position"
import { AiOutlineReload } from "react-icons/ai"
import {
  PiGearFineDuotone,
  PiPlayDuotone,
  PiPauseDuotone,
} from "react-icons/pi"
import { BsArrowsExpand, BsArrowsCollapse } from "react-icons/bs"
import MarketData from "@/components/MarketData"

const interval = 30

const ToggleCompact = ({compact, toggleCompact, className="p-2.5", iconClassName="w-5 h-5 sm:h-6 sm:w-6"}) => {
  return (
    <button
      className={className}
      onClick={toggleCompact}
    >
      {compact ? (
        <BsArrowsExpand className={iconClassName} />
      ) : (
        <BsArrowsCollapse className={iconClassName} />
      )}
    </button>
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
  const [compactData, setCompactData] = useState(false)
  const [aaveData, setAaveData] = useState({})
  const [sparkData, setSparkData] = useState({})
  const [hiddenPositions, setHiddenPositions] = useState([])
  const [stop, setStop] = useState(false)

  const toggleCompact = () => {
    if (compact) {
      setCompact(false)
      localStorage.removeItem("compact")
    } else {
      setCompact(true)
      localStorage.setItem("compact", true)
    }
  }

  const toggleHiddenPosition = (index) => {
    let newPositions
    if (hiddenPositions.includes(index)) {
      newPositions = hiddenPositions.filter((i) => i !== index)
    } else {
      newPositions = [...hiddenPositions, index]
    }
    setHiddenPositions(newPositions)
    localStorage.setItem("hiddenPositions", JSON.stringify(newPositions))
  }

  useEffect(() => {
    if (localStorage.getItem("address")) {
      setAddress(localStorage.getItem("address"))
    }
    if (localStorage.getItem("compact")) {
      setCompact(true)
    }
    if (localStorage.getItem("hiddenPositions")) {
      try {
        setHiddenPositions(JSON.parse(localStorage.getItem("hiddenPositions")))
      } catch (_) {
        localStorage.removeItem("hiddenPositions")
      }
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
    let _aaveData = await fetchMarketData({ user: address, rpc, market: "aave"})
    if(!_aaveData) return
    _aaveData.MarketName = "AAVE"
    setAaveData(_aaveData)
  }
  const getSparkData = async () => {
    let _sparkData = await fetchMarketData({ user: address, rpc, market: "spark"})
    if(!_sparkData) return
    _sparkData.MarketName = "SPARK"
    setSparkData(_sparkData)
  }

  const loadData = async () => {
    scanTransfers({ address, publicClient, rpc })
    getBalances()
    getTransfers()
    getAaveData()
    getSparkData()
    setTimer(interval)
  }

  useEffect(() => {
    if (address && rpc && !stop) {
      try {
        if (!isAddress(getAddress(address))) {
          setError(`Invalid address ${address}`)
          return
        }
        loadData()

        const countdown = setInterval(() => {
          setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : interval))
        }, 1000)
        return () => clearInterval(countdown)
      } catch (e) {
        setError(`Invalid address ${address}`)
      }
    }
  }, [address, rpc, stop])

  useEffect(() => {
    if (timer === 0) {
      loadData()
    }
  }, [timer])

  return (
    <main className="p-4 lg:p-24 relative">
      <div className="z-10 max-w-3xl text-lg mx-auto mb-4">
        <div className=" dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit w-auto  rounded-xl border leading-none ">
          <div className="rounded-xl shadow flex items-center p-1 pr-4">
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
                  <h3 className="mt-6  font-medium text-lg border-b pb-4 dark:border-white/5">
                    Show/Hide Positions
                  </h3>
                  {tokens.map((token, index) => (
                    <div key={index} className="mt-4">
                      <label>
                        <input
                          className="mr-2"
                          type="checkbox"
                          id={token.name}
                          name={token.name}
                          defaultChecked={!hiddenPositions.includes(index)}
                          checked={!hiddenPositions.includes(index)}
                          onChange={() => toggleHiddenPosition(index)}
                        />
                        {token.description}
                      </label>
                    </div>
                  ))}
                </>
              }
              onConfirm={() => console.log("Button confirm")}
              buttons={[
                {
                  role: "confirm",
                  toClose: true,
                  classes:
                    "bg-green-800 px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200",
                  label: "Confirm",
                },
              ]}
            >
              <button>
                <PiGearFineDuotone className="w-6 h-6 sm:h-7 sm:w-7" />
              </button>
            </Modal>

            <ToggleCompact compact={compact} toggleCompact={toggleCompact} />
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
      </div>
      {address && (
        <div className="w-full">
          {error ? (
            <p className="text-red-500 text-center max-w-2xl">{error}</p>
          ) : (
            <div className="text-center">
              <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {balances.map((balance, index) =>
                  hiddenPositions.includes(index) ? null : (
                    <div key={index} className="w-full">
                      <Position
                        balance={balance}
                        index={index}
                        address={address}
                        transfers={transfers}
                        compact={compact}
                        marketData={{aaveData, sparkData}}
                        toggleHiddenPosition={toggleHiddenPosition}
                      />
                    </div>
                  )
                )}
              </div>
              <div className="mt-8 px-4 flex justify-between max-w-3xl mx-auto">
                <div>
                  <button
                    title="Pause/Resume auto-refresh"
                    className="text-center relative z-10"
                    onClick={() => setStop(!stop)}
                  >
                    <span className="flex items-center gap-2">
                      {stop ? (
                        <PiPlayDuotone className="text-xl inline" /> 
                      ) : (
                        <PiPauseDuotone className="text-xl inline" />
                      )}
                    </span>
                  </button>
                  <button
                    title="Reload data"
                    className="text-center relative z-10"
                    onClick={() => loadData()}
                  >
                    <span className="flex items-center gap-2">
                      <AiOutlineReload className="text-xl inline" /> 
                      {!stop && (
                        <span className="text-sm">{timer}s</span>
                      )}
                    </span>
                  </button>
                </div>
                <div>
                  <MarketData data={aaveData} compactData={compactData} setCompactData={setCompactData} />
                  <MarketData data={sparkData} compactData={compactData} setCompactData={setCompactData} />
                </div>
              </div>


            </div>
          )}
        </div>
      )}
    </main>
  )
}
