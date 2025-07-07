
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
        <span className="inline-flex items-baseline">
          {formatCurrency(row.revenue)}
          {revenueChange && <ChangeIndicator percentageChange={revenueChange.percentageChange} />}
        </span>
      </TableCell>
      <TableCell className="text-right text-slate-700">
        <span className="inline-flex items-baseline">
          {formatCurrency(row.adSpend)}
          {adSpendChange && <ChangeIndicator percentageChange={adSpendChange.percentageChange} />}
        </span>
      </TableCell>
      <TableCell className="text-right text-slate-700">
        <span className="inline-flex items-baseline">
          {formatCurrency(row.totalCosts)}
          {totalCostsChange && <ChangeIndicator percentageChange={totalCostsChange.percentageChange} />}
        </span>
      </TableCell>
      <TableCell className="text-right font-semibold text-slate-800">
        <span className="inline-flex items-baseline">
          {formatCurrency(row.profit)}
          {profitChange && <ChangeIndicator percentageChange={profitChange.percentageChange} />}
        </span>
      </TableCell>
      <TableCell className="text-right font-medium text-slate-700">
        <span className="inline-flex items-baseline">
          {row.profitMargin.toFixed(1)}%
          {marginChange && <ChangeIndicator percentageChange={marginChange.percentageChange} />}
        </span>
      </TableCell>
      <TableCell className="text-right text-slate-700">
        <span className="inline-flex items-baseline">
          {row.orders.toLocaleString()}
          {ordersChange && <ChangeIndicator percentageChange={ordersChange.percentageChange} />}
        </span>
      </TableCell>
      <TableCell className="text-right text-slate-600">
        <span className="inline-flex items-baseline">
          {formatCurrencyWithDecimals(row.cpa)}
          {cpaChange && <ChangeIndicator percentageChange={cpaChange.percentageChange} />}
        </span>
      </TableCell>
      <TableCell className="text-right text-slate-600">
        <span className="inline-flex items-baseline">
          {formatCurrencyWithDecimals(row.adjustedCpa)}
          {adjustedCpaChange && <ChangeIndicator percentageChange={adjustedCpaChange.percentageChange} />}
        </span>
      </TableCell>
      <TableCell className="text-right text-slate-700">
        <span className="inline-flex items-baseline">
          {formatCurrencyWithDecimals(row.avgSale)}
          {avgSaleChange && <ChangeIndicator percentageChange={avgSaleChange.percentageChange} />}
        </span>
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
