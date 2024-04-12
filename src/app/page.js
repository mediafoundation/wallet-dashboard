"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { http, createConfig } from "wagmi"
import { mainnet } from "wagmi/chains"
import { getBalance } from "@wagmi/core"
import { createPublicClient, formatEther, getContract, isAddress, getAddress } from 'viem'

export const erc4626 = [
  {
    inputs: [
      { internalType: "address", name: "_daiJoin", type: "address" },
      { internalType: "address", name: "_pot", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMIT_TYPEHASH",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "asset",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    name: "convertToAssets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    name: "convertToShares",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dai",
    outputs: [{ internalType: "contract DaiLike", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "daiJoin",
    outputs: [
      { internalType: "contract DaiJoinLike", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "deploymentChainId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "deposit",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "maxDeposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "maxMint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "maxRedeem",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "maxWithdraw",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "nonces",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pot",
    outputs: [{ internalType: "contract PotLike", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    name: "previewDeposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    name: "previewMint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    name: "previewRedeem",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    name: "previewWithdraw",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "redeem",
    outputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalAssets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "vat",
    outputs: [{ internalType: "contract VatLike", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
]

export function Loader(props) {
  return (
    <svg className={props.className ? props.className : "w-10 h-10 block mx-auto textMuted my-6" } version="1.1" id="L7" x="0px" y="0px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100">
     <path fill="currentColor" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
      c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
          <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
      </path>
     <path fill="currentColor" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7
      c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
          <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite"></animateTransform>
      </path>
     <path fill="currentColor" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
      L82,35.7z">
          <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
      </path>
    </svg>
  );
}

export default function Home() {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState("")
  const [error, setError] = useState(null)
  const [timer, setTimer] = useState(30)
  const [rpc, setRpc] = useState("")

  useEffect(() => {
    if(localStorage.getItem("address")){
      setAddress(localStorage.getItem("address"))
    }
    setRpc(localStorage.getItem("rpc") ? localStorage.getItem("rpc") : "https://cloudflare-eth.com")
  }, [])

  const config = createConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(rpc),
    },
  })

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(rpc),
  })

  const tokens = [
    {
      name: "USDC",
      description: "aEthUSDC",
      logo: "/usdc.svg",
      token: "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c",
      chainId: 1,
      type: "ERC20",
    },
    {
      name: "USDT",
      description: "aEthUSDT",
      logo: "/usdt.svg",
      token: "0x23878914efe38d27c4d67ab83ed1b93a74d4086a",
      chainId: 1,
      type: "ERC20",
    },
    {
      name: "DAI",
      description: "aEthDAI",
      logo: "/dai.svg",
      token: "0x018008bfb33d285247a21d44e50697654f754e63",
      chainId: 1,
      type: "ERC20",
    },
    {
      name: "DAI",
      description: "sDAI",
      logo: "/dai.svg",
      token: "0x83F20F44975D03b1b09e64809B757c47f942BEeA",
      chainId: 1,
      type: "ERC4626",
    }
  ]


  const getBalances = async () => {
    if(!address) return
    setLoading(true)
    try {
      const balances = await Promise.all(
        tokens.map(async (token) => {
          const balance = await getBalance(config, {address: getAddress(address), chainId: token.chainId, token: token.token})
  
          if (token.type === "ERC20") {
            return balance
          } else {
  
            const contract = getContract({
              address: token.token,
              abi: erc4626,
              // 1a. Insert a single client
              client: publicClient,
            })
            const result = await contract.read.convertToAssets([balance.value]);
            balance.formatted = formatEther(result)
            return balance
          }
        })
      )
      setError(null)
      setBalances(balances)
      document.title = `${balances.reduce((acc, balance) => acc + Number(balance.formatted), 0).toLocaleString()} | ${getAddress(address)}`
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
    if(address) {
      try{
        if(!isAddress(getAddress(address))) {
          setError(`Invalid address ${address}`)
          return
        }
        getBalances(); // Initial fetch on component mount
        let interval = setInterval(() => {
          getBalances(); // Re-fetch every 10 seconds
          setTimer(31);  // Reset the timer
        }, 31000);
    
        const countdown = setInterval(() => {
          setTimer(prevTimer => prevTimer > 0 ? prevTimer - 1 : 30);
        }, 1000); // Countdown every second, reset to 10 if reaches 0
    
        return () => {
          clearInterval(interval);
          clearInterval(countdown);
        };
      }catch(e){
        setError(`Invalid address ${address}` )
      }
    }
  }, [address, rpc]);
  

  return (
      <main className="flex min-h-screen flex-col items-center gap-12 p-4 lg:p-24">
        <div className="z-10 w-full md:w-[32rem] items-center justify-center text-lg">

          <input 
            type="text" 
            name="rpc"
            className="bg-gradient-to-b from-zinc-200 px-5 py-4 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit rounded-xl border bg-gray-200 flex leading-none w-full" 
            value={rpc} 
            onChange={(e) => setRPCAndSaveToLocalStorage(e.target.value)} 
            placeholder="Enter RPC Url"
          />

          <input 
            type="text" 
            name="wallet"
            className=" mt-4 bg-gradient-to-b from-zinc-200 px-5 py-4 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit rounded-xl border bg-gray-200 flex leading-none w-full" 
            value={address} 
            onChange={(e) => setAddressAndSaveToLocalStorage(e.target.value)} 
            placeholder="Enter your wallet address"
          />
          <p className=" mt-4 bg-gradient-to-b from-zinc-200 px-5 py-4 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit w-auto  rounded-xl border bg-gray-200 flex leading-none">
            <span>Wallet Balance</span>
            {loading ? <Loader className="w-4 h-4 ml-auto" /> : <span className="font-mono font-bold ml-auto">${balances.reduce((acc, balance) => acc + Number(balance.formatted), 0).toLocaleString()}</span>}
          </p>
        </div>
        {address && (
          <div>
            {error ? <p className="text-red-500 text-center max-w-2xl">{error}</p> : (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  {balances.map((balance, index) => {
                    if(balance.value > 0){
                      return (
                        <div key={index} className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
                          <div className="flex gap-4">
                              <div
                                key={index}
                                className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg dark:bg-black/50 gap-2 relative"
                              >
                                <h2 className="text-2xl font-bold ">
                                  <a className="after:content-[''] after:z-10 after:absolute after:inset-0 flex gap-2" href={`https://etherscan.io/token/${tokens[index].token}?a=${address}`} target="_blank">
                                  <Image
                                    src={tokens[index].logo}
                                    alt={tokens[index].name}
                                    width={32}
                                    height={32}
                                  />
                                    {tokens[index].name}
                                  </a>
                                </h2>
                                <p className="text-lg font-mono">
                                  {Number(balance.formatted).toLocaleString()}
                                </p>
                                <p className="text-xs font-mono">
                                  {tokens[index].description}
                                </p>

                              </div>
                          </div>
                        </div>
                      )
                    }
                  })}
                </div>

                <button 
                  className="block w-full mt-8 text-center relative z-10"
                  onClick={() => getBalances()}
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
