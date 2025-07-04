
import { formatValue } from '@/utils/chartUtils';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
  isRevenue: boolean;
}

const ChartTooltip = ({ active, payload, label, isRevenue }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className={`text-sm font-semibold ${isRevenue ? 'text-green-600' : 'text-blue-600'}`}>
          Current: {formatValue(payload[0].value, isRevenue)}
        </p>
        {payload[1] && payload[1].value !== null && (
          <p className="text-sm text-gray-600">
            Previous Year: {formatValue(payload[1].value, isRevenue)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default ChartTooltip;
