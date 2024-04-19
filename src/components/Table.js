import DynamicDataTable from "@langleyfoxall/react-dynamic-data-table"

export const Table = ({ rows, compact }) => {
  if (!rows) return null
  // only take row.reserve of each row
  let market = rows.map((row) => row.reserve)
  for (let i = 0; i < market.length; i++) {
    market[i].userUnderlyingBalance = rows[i].underlyingBalance
  }
  let fieldsToExclude = compact ? ['id', 'underlyingAsset', 'baseLTVasCollateral', 'reserveLiquidationThreshold', 'reserveLiquidationBonus', 'reserveFactor', 'usageAsCollateralEnabled', 'borrowingEnabled', 'stableBorrowRateEnabled', 'isActive', 'isFrozen', 'liquidityIndex', 'variableBorrowIndex', 'liquidityRate', 'variableBorrowRate', 'stableBorrowRate', 'lastUpdateTimestamp', 'interestRateStrategyAddress', 'availableLiquidity', 'totalPrincipalStableDebt', 'averageStableRate', 'stableDebtLastUpdateTimestamp', 'totalScaledVariableDebt', 'priceInMarketReferenceCurrency', 'priceOracle', 'variableRateSlope1', 'variableRateSlope2', 'stableRateSlope1', 'stableRateSlope2', 'baseStableBorrowRate', 'baseVariableBorrowRate', 'optimalUsageRatio', 'isPaused', 'debtCeiling', 'eModeCategoryId', 'borrowCap', 'supplyCap', 'eModeLtv', 'eModeLiquidationThreshold', 'eModeLiquidationBonus', 'eModePriceSource', 'eModeLabel', 'borrowableInIsolation', 'accruedToTreasury', 'unbacked', 'isolationModeTotalDebt', 'debtCeilingDecimals', 'isSiloedBorrowing', 'flashLoanEnabled', 'totalStableDebt', 'borrowUsageRatio', 'formattedReserveLiquidationBonus', 'formattedEModeLiquidationBonus', 'formattedEModeLiquidationThreshold', 'formattedEModeLtv', 'unborrowedLiquidity', 'formattedBaseLTVasCollateral', 'formattedReserveLiquidationThreshold', 'debtCeilingUSD', 'isolationModeTotalDebtUSD', 'availableDebtCeilingUSD', 'isIsolated', 'totalLiquidityUSD', 'availableLiquidityUSD', 'totalDebtUSD', 'totalVariableDebtUSD', 'totalStableDebtUSD', 'formattedPriceInMarketReferenceCurrency', 'unbackedUSD', 'stableBorrowAPY', 'stableBorrowAPR'] : null;
  return (
    <>
      <DynamicDataTable
        buttons={[]}
        className="table-fixed whitespace-nowrap text-left [&_td]:border-b [&_th]:border-b [&_th]:dark:border-white/25 [&_th]:pb-1  [&_td]:dark:border-white/10 [&_td]:pr-2 [&_th]:pr-3"
        rows={market}
        fieldsToExclude={fieldsToExclude}
      />
    </>
  )
}
export default Table