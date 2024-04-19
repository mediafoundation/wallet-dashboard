import { useMemo, useEffect } from "react"
import { Modal } from "@/components/Modal"
import { Table } from "@/components/Table"
import { RiBarChartBoxLine } from "react-icons/ri"
import { BsArrowsExpand, BsArrowsCollapse } from "react-icons/bs"

export const MarketData = ({ data, compactData, setCompactData }) => {


  const ToggleCompact = useMemo(() => {

    return () => (
      <button
        className={"p-2"}
        onClick={() => {
          if (compactData) {
            setCompactData(false)
            localStorage.removeItem("compactData")
          } else {
            setCompactData(true)
            localStorage.setItem("compactData", true)
          }
        }}
      >
        {compactData ? (
          <BsArrowsExpand className={"text-base"} />
        ) : (
          <BsArrowsCollapse className={"text-base"} />
        )}
      </button>
    )
  }, [compactData]);

  useEffect(() => {
    if (localStorage.getItem("compactData")) {
      setCompactData(true)
    }
  }, [compactData])

  return data && data.userReservesData && (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between w-full">
            <span>{data.MarketName} Data</span> <ToggleCompact />
          </div>
        }
        width=""
        content={<Table rows={data.userReservesData} compact={compactData} />}
        buttons={[]}
      >
      <button className="text-center relative z-10">
        <span className="flex items-center gap-2">
          <RiBarChartBoxLine className="inline" /> {data.MarketName}
        </span>
      </button>
      </Modal>
    </>
  )
}

export default MarketData