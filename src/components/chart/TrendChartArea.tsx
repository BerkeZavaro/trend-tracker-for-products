
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line } from 'recharts';
import { formatValue } from '@/utils/chartUtils';
import ChartTooltip from './ChartTooltip';
import TrendLegend from './TrendLegend';
import { ChartDataPoint } from '@/hooks/useTrendChartData';

interface TrendChartAreaProps {
  data: ChartDataPoint[];
  metric: 'revenue' | 'cpa';
  isExpanded: boolean;
}

const TrendChartArea = ({ data, metric, isExpanded }: TrendChartAreaProps) => {
  const isRevenue = metric === 'revenue';

  return (
    <>
      <div className={`${isExpanded ? 'h-[500px]' : 'h-64'} transition-all duration-300`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id={`${metric}Gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isRevenue ? "#10b981" : "#3b82f6"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isRevenue ? "#10b981" : "#3b82f6"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              tickFormatter={(value) => formatValue(value, isRevenue)}
            />
            <Tooltip content={<ChartTooltip isRevenue={isRevenue} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isRevenue ? "#10b981" : "#3b82f6"}
              strokeWidth={2}
              fill={`url(#${metric}Gradient)`}
            />
            <Line
              type="monotone"
              dataKey="previousYear"
              stroke="#9ca3af"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <TrendLegend isRevenue={isRevenue} />
    </>
  );
};

export default TrendChartArea;
