
import { formatValue } from '@/utils/chartUtils';
import { MetricType } from './MetricSelector';

interface DynamicChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    stroke: string;
    strokeDasharray?: string;
  }>;
  label?: string;
}

const METRIC_LABELS: Record<MetricType, string> = {
  revenue: 'Revenue',
  adSpend: 'Ad Spend',
  totalCost: 'Total Cost',
  orders: 'Orders',
  cpa: 'CPA',
  avgOrderValue: 'Avg Order Value'
};

const formatMetricValue = (value: number, metric: string): string => {
  if (metric === 'orders') {
    return value.toLocaleString();
  }
  if (metric === 'revenue' || metric === 'adSpend' || metric === 'totalCost' || metric === 'avgOrderValue') {
    return formatValue(value, true);
  }
  if (metric === 'cpa') {
    return formatValue(value, false);
  }
  return value.toString();
};

const DynamicChartTooltip = ({ active, payload, label }: DynamicChartTooltipProps) => {
  if (active && payload && payload.length) {
    // Group by current vs previous period
    const currentPeriod = payload.filter(p => !p.dataKey.includes('previousYear'));
    const previousPeriod = payload.filter(p => p.dataKey.includes('previousYear'));

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

        {/* Previous Period */}
        {previousPeriod.length > 0 && (
          <>
            <div className="border-t pt-2 mt-2">
              <p className="text-xs text-gray-500 font-medium mb-1">Previous Period:</p>
              {previousPeriod.map((entry, index) => {
                const metric = entry.dataKey.replace('previousYear.', '') as MetricType;
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
