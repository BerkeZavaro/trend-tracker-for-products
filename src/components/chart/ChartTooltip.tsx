
import { formatValue } from '@/utils/chartUtils';
import { formatCurrencyWithDecimals } from '@/utils/performanceMetrics';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
  isRevenue: boolean;
}

const ChartTooltip = ({ active, payload, label, isRevenue }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const currentValue = payload.find(p => p.dataKey === 'value')?.value || 0;
    const previousYear = payload.find(p => p.dataKey === 'previousYear')?.value;
    const averageSale = payload.find(p => p.dataKey === 'averageSale')?.value;
    const previousYearAverageSale = payload.find(p => p.dataKey === 'previousYearAverageSale')?.value;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className={`text-sm font-semibold ${isRevenue ? 'text-green-600' : 'text-blue-600'}`}>
          {isRevenue ? 'Revenue' : 'CPA'}: {formatValue(currentValue, isRevenue)}
        </p>
        {!isRevenue && averageSale !== undefined && (
          <>
            <p className="text-sm font-semibold text-orange-600">
              Avg Sale: {formatCurrencyWithDecimals(averageSale)}
            </p>
            {averageSale > 0 && currentValue > 0 && (
              <p className="text-sm text-gray-700 font-medium">
                Difference: ${(averageSale - currentValue).toFixed(2)}
              </p>
            )}
          </>
        )}
        {previousYear !== null && previousYear !== undefined && (
          <p className="text-sm text-gray-600">
            Previous Year {isRevenue ? 'Revenue' : 'CPA'}: {formatValue(previousYear, isRevenue)}
          </p>
        )}
        {!isRevenue && previousYearAverageSale !== null && previousYearAverageSale !== undefined && (
          <>
            <p className="text-sm text-orange-400">
              Previous Year Avg Sale: {formatCurrencyWithDecimals(previousYearAverageSale)}
            </p>
            {previousYearAverageSale > 0 && previousYear !== null && previousYear !== undefined && previousYear > 0 && (
              <p className="text-sm text-gray-500">
                Previous Year Difference: ${(previousYearAverageSale - previousYear).toFixed(2)}
              </p>
            )}
          </>
        )}
      </div>
    );
  }
  return null;
};

export default ChartTooltip;
