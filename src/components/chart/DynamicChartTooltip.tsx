
import { formatValue } from '@/utils/chartUtils';
import { formatCurrencyWithDecimals } from '@/utils/performanceMetrics';
import { MetricType } from './MetricSelector';

interface DynamicChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    stroke: string;
    strokeDasharray?: string;
    name?: string;
    payload?: any; // The full data point object
  }>;
  label?: string;
  comparisonLabel?: string;
}

const METRIC_LABELS: Record<MetricType, string> = {
  revenue: 'Revenue',
  adSpend: 'Ad Spend',
  totalCost: 'Total Cost',
  orders: 'Orders',
  adjustedCpa: 'Adjusted CPA',
  avgOrderValue: 'Avg Order Value',
  profit: 'Profit'
};

const formatMetricValue = (value: number, metric: string): string => {
  if (metric === 'orders') {
    return value.toLocaleString();
  }
  if (metric === 'avgOrderValue') {
    return formatCurrencyWithDecimals(value);
  }
  if (metric === 'revenue' || metric === 'adSpend' || metric === 'totalCost' || metric === 'profit') {
    return formatValue(value, true);
  }
  if (metric === 'adjustedCpa') {
    return formatValue(value, false);
  }
  return value.toString();
};

const DynamicChartTooltip = ({ 
  active, 
  payload, 
  label, 
  comparisonLabel = 'Previous Period'
}: DynamicChartTooltipProps) => {
  if (active && payload && payload.length) {
    // Group by current vs comparison period
    const currentPeriod = payload.filter(p => !p.dataKey.includes('comparison'));
    const comparisonPeriod = payload.filter(p => p.dataKey.includes('comparison'));

    // Extract comparisonMonth from the first payload item that has it
    const comparisonMonth = payload[0]?.payload?.comparisonMonth;

    // Create enhanced comparison label with date from the data point
    const enhancedComparisonLabel = comparisonMonth 
      ? `${comparisonLabel} ${comparisonMonth}`
      : comparisonLabel;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg max-w-xs">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        
        {/* Current Period */}
        {currentPeriod.map((entry, index) => {
          const metric = entry.dataKey as MetricType;
          const label = METRIC_LABELS[metric];
          return (
            <p key={index} className="text-sm font-semibold mb-1" style={{ color: entry.stroke }}>
              {label}: {formatMetricValue(entry.value, metric)}
            </p>
          );
        })}

        {/* Comparison Period */}
        {comparisonPeriod.length > 0 && (
          <>
            <div className="border-t pt-2 mt-2">
              <p className="text-xs text-gray-500 font-medium mb-1">{enhancedComparisonLabel}:</p>
              {comparisonPeriod.map((entry, index) => {
                const metric = entry.dataKey.replace('comparison.', '') as MetricType;
                const label = METRIC_LABELS[metric];
                return (
                  <p key={index} className="text-sm text-gray-600 mb-1">
                    {label}: {formatMetricValue(entry.value, metric)}
                  </p>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
};

export default DynamicChartTooltip;
