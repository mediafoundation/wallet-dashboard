import { getTransfersData } from "@/utils"
import { formatUnits } from "viem"
import { Modal } from "@/components/Modal"
import { PiEyeSlashDuotone } from "react-icons/pi"
import { BsReceipt } from "react-icons/bs"

export const Transfers = ({
  transfers,
  token,
  balance,
  index,
  toggleHiddenPosition,
}) => {
  const { transfer_from, transfer_to } = getTransfersData({
    transfers,
    token,
    balance,
  })

  return (
    <div className="z-50 text-center text-sm font-sans mt-2 pt-1 mb-4 border-t dark:border-white/5">
      <div className="absolute text-base text-black/80 dark:text-white/80 right-0 left-0 text-center flex justify-between px-[22px]">
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
                      {formatUnits(
                        BigInt(transfer._value),
                        token.assetDecimals
                      )}
                    </a>
                  </div>
                </div>
              ))}
              {transfer_to.length == 0 && (
                <div className="dark:text-white/80 ">
                  No deposit transactions found
                </div>
              )}
              <div className="text-lg border-t dark:border-white/5 mt-6 pt-6">
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
                      {formatUnits(
                        BigInt(transfer._value),
                        token.assetDecimals
                      )}
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
          <button title="Show asset transactions" className="p-1.5"><BsReceipt /></button>
        </Modal>
        <button title="Hide this asset" className="p-1.5" onClick={() => toggleHiddenPosition(index)}>
          <PiEyeSlashDuotone />
        </button>
      </div>
    </div>
  )
}
export default Transfers
