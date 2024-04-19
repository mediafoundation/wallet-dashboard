import { getBalance } from "@wagmi/core"
import {
  formatEther,
  formatUnits,
  getContract,
  getAddress,
  isAddress,
  parseAbiItem,
} from "viem"

import { ethers } from "ethers"
import { UiPoolDataProvider, ChainId } from "@aave/contract-helpers"
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book"
import { formatReserves, formatUserSummary } from "@aave/math-utils"
import dayjs from "dayjs"


export const markets = {
  "aave":{
    poolDataProvider: AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
    poolProvider: AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
  },
  "spark": {
    poolDataProvider: '0xF028c2F4b19898718fD0F77b9b881CbfdAa5e8Bb',
    poolProvider: '0x02C3eA4e34C0cBd694D2adFa2c690EECbC1793eE',
  }
}

export const genesisBlock = 16428133

export const tokens = [
  {
    name: "DAI",
    description: "sDAI",
    spLogo: "/sdai.svg",
    logo: "/dai.svg",
    contract: "0x83F20F44975D03b1b09e64809B757c47f942BEeA",
    spToken: "0x4DEDf26112B3Ec8eC46e7E31EA5e123490B05B8B",
    vdToken: "0xf705d2B7e92B3F38e6ae7afaDAA2fEE110fE5914", //varible debt token (borrowed)
    asset: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    assetDecimals: 18,
    chainId: 1,
    type: "ERC4626",
    genesis: 16428133,
  },
  {
    name: "USDC",
    description: "aEthUSDC",
    spLogo: "/aethusdc.svg",
    logo: "/usdc.svg",
    contract: "0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c",
    asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    assetDecimals: 6,
    chainId: 1,
    type: "ERC20",
    genesis: 16496802,
  },
  {
    name: "USDT",
    description: "aEthUSDT",
    spLogo: "/aethusdt.svg",
    logo: "/usdt.svg",
    contract: "0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a",
    asset: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    assetDecimals: 6,
    chainId: 1,
    type: "ERC20",
    genesis: 16620256,
  },
  {
    name: "DAI",
    description: "aEthDAI",
    spLogo: "/aethdai.svg",
    logo: "/dai.svg",
    contract: "0x018008bfb33d285247A21d44E50697654f754e63",
    asset: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    assetDecimals: 18,
    chainId: 1,
    type: "ERC20",
    genesis: 16496806,
  },
]

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

export const erc20 = [
  {
    inputs: [
      {
        internalType: "address",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
]

export const getTransfers = async ({
  publicClient,
  from,
  tokens,
  fromBlock,
  toBlock,
}) => {
  const addresses = tokens.map((token) => token.contract)
  const assets = tokens.map((token) => token.asset)

  const all = [...new Set([...addresses, ...assets])]
  const meandcontract = [...new Set([...addresses, from])]

  const logs = await publicClient.getLogs({
    address: all,
    event: parseAbiItem(
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ),
    args: {
      from: meandcontract,
      to: meandcontract,
    },
    fromBlock,
    toBlock,
  })

  return logs
}

export const fetchBalances = async ({
  config,
  publicClient,
  address,
  tokens,
}) => {
  if (!address) return false
  try {
    const balances = await Promise.all(
      tokens.map(async (token) => {
        const balance = await getBalance(config, {
          address: getAddress(address),
          chainId: token.chainId,
          token: token.contract,
        })

        if (token.type === "ERC20") {
          const underlying = await getBalance(config, {
            address: token.contract,
            chainId: token.chainId,
            token: token.asset,
          })
          balance.underlying = underlying
          return balance
        } else {
          const contract = getContract({
            address: token.contract,
            abi: erc4626,
            // 1a. Insert a single client
            client: publicClient,
          })
          const underlying = await contract.read.totalAssets()
          const result = await contract.read.convertToAssets([balance.value])
          balance.formatted = formatEther(result)
          balance.value = result
          balance.underlying = {
            decimals: token.assetDecimals,
            symbol: token.name,
            value: underlying,
            formatted: formatUnits(underlying, token.assetDecimals),
          }
          return balance
        }
      })
    )
    return balances
  } catch (error) {
    console.log(error)
    return false
  }
}


export const calculateInterest = ({ transfers, balances }) => {
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

export function Loader(props) {
  return (
    <svg
      className={
        props.className
          ? props.className
          : "w-10 h-10 block mx-auto textMuted my-6"
      }
      version="1.1"
      id="L7"
      x="0px"
      y="0px"
      viewBox="0 0 100 100"
      enableBackground="new 0 0 100 100"
    >
      <path
        fill="currentColor"
        d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
      c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          dur="2s"
          from="0 50 50"
          to="360 50 50"
          repeatCount="indefinite"
        ></animateTransform>
      </path>
      <path
        fill="currentColor"
        d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7
      c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          dur="1s"
          from="0 50 50"
          to="-360 50 50"
          repeatCount="indefinite"
        ></animateTransform>
      </path>
      <path
        fill="currentColor"
        d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
      L82,35.7z"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          dur="2s"
          from="0 50 50"
          to="360 50 50"
          repeatCount="indefinite"
        ></animateTransform>
      </path>
    </svg>
  )
}

export function toLocaleString(number, units = 3) {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: units,
    maximumFractionDigits: units,
  })
}

export const CogIcon = ({ className }) => (
  <svg
    className={className}
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 256 256"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M230.1,108.76,198.25,90.62c-.64-1.16-1.31-2.29-2-3.41l-.12-36A104.61,104.61,0,0,0,162,32L130,49.89c-1.34,0-2.69,0-4,0L94,32A104.58,104.58,0,0,0,59.89,51.25l-.16,36c-.7,1.12-1.37,2.26-2,3.41l-31.84,18.1a99.15,99.15,0,0,0,0,38.46l31.85,18.14c.64,1.16,1.31,2.29,2,3.41l.12,36A104.61,104.61,0,0,0,94,224l32-17.87c1.34,0,2.69,0,4,0L162,224a104.58,104.58,0,0,0,34.08-19.25l.16-36c.7-1.12,1.37-2.26,2-3.41l31.84-18.1A99.15,99.15,0,0,0,230.1,108.76ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"
      opacity="0.2"
    ></path>
    <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm109.94-52.79a8,8,0,0,0-3.89-5.4l-29.83-17-.12-33.62a8,8,0,0,0-2.83-6.08,111.91,111.91,0,0,0-36.72-20.67,8,8,0,0,0-6.46.59L128,41.85,97.88,25a8,8,0,0,0-6.47-.6A111.92,111.92,0,0,0,54.73,45.15a8,8,0,0,0-2.83,6.07l-.15,33.65-29.83,17a8,8,0,0,0-3.89,5.4,106.47,106.47,0,0,0,0,41.56,8,8,0,0,0,3.89,5.4l29.83,17,.12,33.63a8,8,0,0,0,2.83,6.08,111.91,111.91,0,0,0,36.72,20.67,8,8,0,0,0,6.46-.59L128,214.15,158.12,231a7.91,7.91,0,0,0,3.9,1,8.09,8.09,0,0,0,2.57-.42,112.1,112.1,0,0,0,36.68-20.73,8,8,0,0,0,2.83-6.07l.15-33.65,29.83-17a8,8,0,0,0,3.89-5.4A106.47,106.47,0,0,0,237.94,107.21Zm-15,34.91-28.57,16.25a8,8,0,0,0-3,3c-.58,1-1.19,2.06-1.81,3.06a7.94,7.94,0,0,0-1.22,4.21l-.15,32.25a95.89,95.89,0,0,1-25.37,14.3L134,199.13a8,8,0,0,0-3.91-1h-.19c-1.21,0-2.43,0-3.64,0a8.1,8.1,0,0,0-4.1,1l-28.84,16.1A96,96,0,0,1,67.88,201l-.11-32.2a8,8,0,0,0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.09,8.09,0,0,0-3-3.06l-28.6-16.29a90.49,90.49,0,0,1,0-28.26L61.67,97.63a8,8,0,0,0,3-3c.58-1,1.19-2.06,1.81-3.06a7.94,7.94,0,0,0,1.22-4.21l.15-32.25a95.89,95.89,0,0,1,25.37-14.3L122,56.87a8,8,0,0,0,4.1,1c1.21,0,2.43,0,3.64,0a8,8,0,0,0,4.1-1l28.84-16.1A96,96,0,0,1,188.12,55l.11,32.2a8,8,0,0,0,1.22,4.22c.62,1,1.23,2,1.8,3.06a8.09,8.09,0,0,0,3,3.06l28.6,16.29A90.49,90.49,0,0,1,222.9,142.12Z"></path>
  </svg>
)

export const ExpandIcon = ({ className }) => (
  <svg
    className={className}
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="none" d="M0 0h24v24H0V0z"></path>
    <path d="M4 20h16v2H4zM4 2h16v2H4zM9.41 13.59 8 15l4 4 4-4-1.41-1.41L13 15.17V8.83l1.59 1.58L16 9l-4-4-4 4 1.41 1.41L11 8.83v6.34z"></path>
  </svg>
)

export const multiBalanceCall = async ({ publicClient, address, tokens }) => {
  let erc20_calls = []

  for (const token of tokens) {
    erc20_calls.push({
      address: token.contract,
      abi: erc20,
      functionName: "balanceOf",
      args: [address],
    })

    erc20_calls.push({
      address: token.asset,
      abi: erc20,
      functionName: "balanceOf",
      args: [token.contract],
    })

    erc20_calls.push({
      address: token.contract,
      abi: erc20,
      functionName: "totalSupply",
      args: [],
    })
  }

  const results = await publicClient.multicall({ contracts: erc20_calls })

  let balances = []
  let i = 0

  for (const token of tokens) {
    balances.push({
      symbol: token.description,
      decimals: token.assetDecimals,
      value: results[i].result,
      formatted: formatUnits(results[i].result, token.assetDecimals),
      underlying: {
        decimals: token.assetDecimals,
        symbol: token.name,
        value: results[i + 1].result,
        formatted: formatUnits(results[i + 1].result, token.assetDecimals),
      },
      totalSupply: results[i + 2].result,
      totalSupplyFormatted: formatUnits(
        results[i + 2].result,
        token.assetDecimals
      ),
    })
    i += 3
  }

  let erc4626_calls = []

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === "ERC4626") {
      erc4626_calls.push({
        address: tokens[i].contract,
        abi: erc4626,
        functionName: "convertToAssets",
        args: [[balances[i].value]],
      })

      erc4626_calls.push({
        address: tokens[i].spToken,
        abi: erc4626,
        functionName: "totalSupply",
        args: [],
      })

      erc4626_calls.push({
        address: tokens[i].vdToken,
        abi: erc4626,
        functionName: "totalSupply",
        args: [],
      })

      const results = await publicClient.multicall({ contracts: erc4626_calls })

      balances[i].value = results[0].result
      balances[i].formatted = formatUnits(
        balances[i].value,
        tokens[i].assetDecimals
      )

      balances[i].totalSupply = results[1].result
      balances[i].totalSupplyFormatted = formatUnits(
        balances[i].totalSupply,
        tokens[i].assetDecimals
      )

      balances[i].underlying.value = balances[i].totalSupply - results[2].result
      balances[i].underlying.formatted = formatUnits(
        balances[i].underlying.value,
        tokens[i].assetDecimals
      )
    }
  }

  return balances
}

export const fetchMarketData = async ({ user, rpc, market = "aave" }) => {
  let formattedReserves = []
  try {
    market = markets[market]

    const provider = new ethers.providers.JsonRpcProvider({
      url: rpc,
      skipFetchSetup: true,
    })
  
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: market.poolDataProvider,
      provider,
      chainId: ChainId.mainnet,
    })
  
    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: market.poolProvider,
    })
  
    const reservesArray = reserves.reservesData
    const { marketReferenceCurrencyPriceInUsd, marketReferenceCurrencyDecimals } =
      reserves.baseCurrencyData
  
    const currentTimestamp = dayjs().unix()
  
    formattedReserves = formatReserves({
      reserves: reservesArray,
      currentTimestamp,
      marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: marketReferenceCurrencyPriceInUsd,
    })

    if (user && isAddress(user)) {
      const userReserves =
        await poolDataProviderContract.getUserReservesHumanized({
          lendingPoolAddressProvider: market.poolProvider,
          user,
        })

      formattedReserves = formatUserSummary({
        currentTimestamp,
        marketReferencePriceInUsd: marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals,
        userReserves: userReserves.userReserves,
        formattedReserves,
        userEmodeCategoryId: userReserves.userEmodeCategoryId,
      })
    }
  } catch (e) {
    console.log(e)
    return false
  }

  return formattedReserves
}


export const getTransfersData = ({ transfers, token, balance }) => { 
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

export const scanTransfers = async ({address, publicClient, rpc, maxBlocks = 800}) => {
  if (!address) return
  maxBlocks = maxBlocks - 1;
  const fetchAndLogTransfers = async (startBlock, endBlock) => {
    console.log(`Fetching transfers from block ${startBlock} to ${endBlock}`)
    let txs = await fetch(
      `/api/getTransfers?from=${address}&rpc=${rpc}&fromBlock=${startBlock}&toBlock=${endBlock}`
    )
    let data = await txs.json()
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

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
      let nextEndBlock = Math.min(startBlock + maxBlocks, endBlock) // Calculate the next block to end this batch
      await fetchAndLogTransfers(startBlock, nextEndBlock)
      startBlock = nextEndBlock + 1 // Prepare the start of the next batch
    }
  }

  // Second, scan from just below the first scanned block down to the genesis block, handling in batches if needed
  if (userData && userData.firstblock) {
    endBlock = Number(userData.firstblock) - 1
    startBlock = Math.max(genesisBlock, endBlock - maxBlocks)

    while (startBlock > genesisBlock) {
      await fetchAndLogTransfers(startBlock, endBlock)
      endBlock = startBlock - 1
      startBlock = Math.max(genesisBlock, endBlock - maxBlocks)
    }
  }

  // If there are no user data regarding firstblock and lastblock, scan everything from the current block to the genesis block in batches
  if (!(userData && (userData.firstblock || userData.lastblock))) {
    endBlock = blockNumber
    startBlock = Math.max(genesisBlock, endBlock - maxBlocks)

    while (startBlock >= genesisBlock) {
      await fetchAndLogTransfers(startBlock, endBlock)
      endBlock = startBlock - 1
      startBlock = Math.max(genesisBlock, endBlock - maxBlocks)
    }
  }
}