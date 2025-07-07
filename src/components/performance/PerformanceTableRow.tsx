
import { TableCell, TableRow } from '@/components/ui/table';
import ChangeIndicator from './ChangeIndicator';
import PerformanceBadge from './PerformanceBadge';
import TrendIndicator from './TrendIndicator';
import { calculateChange, calculateOverallTrend } from '@/utils/trendCalculator';
import { formatCurrency, formatCurrencyWithDecimals, getRowBackgroundClass } from '@/utils/performanceMetrics';

interface PerformanceTableRowProps {
  row: any;
  previousRow: any;
  index: number;
}

const PerformanceTableRow = ({ row, previousRow, index }: PerformanceTableRowProps) => {
  // Calculate changes for each metric
  const revenueChange = previousRow ? calculateChange(row.revenue, previousRow.revenue) : null;
  const adSpendChange = previousRow ? calculateChange(row.adSpend, previousRow.adSpend) : null;
  const totalCostsChange = previousRow ? calculateChange(row.totalCosts, previousRow.totalCosts) : null;
  const profitChange = previousRow ? calculateChange(row.profit, previousRow.profit) : null;
  const marginChange = previousRow ? calculateChange(row.profitMargin, previousRow.profitMargin) : null;
  const ordersChange = previousRow ? calculateChange(row.orders, previousRow.orders) : null;
  const cpaChange = previousRow ? calculateChange(row.cpa, previousRow.cpa) : null;
  const adjustedCpaChange = previousRow ? calculateChange(row.adjustedCpa, previousRow.adjustedCpa) : null;
  const avgSaleChange = previousRow ? calculateChange(row.avgSale, previousRow.avgSale) : null;

  const overallTrend = previousRow ? calculateOverallTrend(row, previousRow) : 'stable';
  const rowBgClass = getRowBackgroundClass(row.performanceRating, row.isProfitable);

  return (
    <TableRow key={index} className={rowBgClass}>
      <TableCell className="font-medium text-sm text-slate-800">
        {row.month}
      </TableCell>
      <TableCell className="text-right font-semibold text-slate-800">
        <div>{formatCurrency(row.revenue)}</div>
        {revenueChange && <ChangeIndicator percentageChange={revenueChange.percentageChange} />}
      </TableCell>
      <TableCell className="text-right text-slate-700">
        <div>{formatCurrency(row.adSpend)}</div>
        {adSpendChange && <ChangeIndicator percentageChange={adSpendChange.percentageChange} />}
      </TableCell>
      <TableCell className="text-right text-slate-700">
        <div>{formatCurrency(row.totalCosts)}</div>
        {totalCostsChange && <ChangeIndicator percentageChange={totalCostsChange.percentageChange} />}
      </TableCell>
      <TableCell className="text-right font-semibold text-slate-800">
        <div>{formatCurrency(row.profit)}</div>
        {profitChange && <ChangeIndicator percentageChange={profitChange.percentageChange} />}
      </TableCell>
      <TableCell className="text-right font-medium text-slate-700">
        <div>{row.profitMargin.toFixed(1)}%</div>
        {marginChange && <ChangeIndicator percentageChange={marginChange.percentageChange} />}
      </TableCell>
      <TableCell className="text-right text-slate-700">
        <div>{row.orders.toLocaleString()}</div>
        {ordersChange && <ChangeIndicator percentageChange={ordersChange.percentageChange} />}
      </TableCell>
      <TableCell className="text-right text-slate-600">
        <div>{formatCurrencyWithDecimals(row.cpa)}</div>
        {cpaChange && <ChangeIndicator percentageChange={cpaChange.percentageChange} />}
      </TableCell>
      <TableCell className="text-right text-slate-600">
        <div>{formatCurrencyWithDecimals(row.adjustedCpa)}</div>
        {adjustedCpaChange && <ChangeIndicator percentageChange={adjustedCpaChange.percentageChange} />}
      </TableCell>
      <TableCell className="text-right text-slate-700">
        <div>{formatCurrencyWithDecimals(row.avgSale)}</div>
        {avgSaleChange && <ChangeIndicator percentageChange={avgSaleChange.percentageChange} />}
      </TableCell>
      <TableCell className="text-center">
        <PerformanceBadge rating={row.performanceRating} isProfitable={row.isProfitable} />
      </TableCell>
      <TableCell className="text-center">
        <TrendIndicator trend={overallTrend} />
      </TableCell>
    </TableRow>
  );
};

export default PerformanceTableRow;
