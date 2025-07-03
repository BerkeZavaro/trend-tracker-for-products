
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface TrendChartProps {
  productId: string;
  timeFrame: { start: string; end: string };
  metric: 'revenue' | 'cpa';
}

// Mock data generation
const generateMockData = (metric: 'revenue' | 'cpa') => {
  const months = [
    'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
    'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024',
    'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'
  ];

  if (metric === 'revenue') {
    return months.map((month, index) => ({
      month,
      value: 8000 + Math.random() * 4000 + (index * 100),
      previousYear: index >= 12 ? 7500 + Math.random() * 3500 + ((index - 12) * 80) : null
    }));
  } else {
    return months.map((month, index) => ({
      month,
      value: 85 - (index * 0.8) + (Math.random() * 10 - 5),
      previousYear: index >= 12 ? 88 - ((index - 12) * 0.6) + (Math.random() * 8 - 4) : null
    }));
  }
};

const TrendChart = ({ productId, timeFrame, metric }: TrendChartProps) => {
  const data = generateMockData(metric);
  const isRevenue = metric === 'revenue';
  
  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const trend = currentValue > previousValue ? 'up' : 'down';
  const trendPercent = Math.abs(((currentValue - previousValue) / previousValue) * 100);

  const formatValue = (value: number) => {
    if (isRevenue) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    return `$${value.toFixed(2)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className={`text-sm font-semibold ${isRevenue ? 'text-green-600' : 'text-blue-600'}`}>
            Current: {formatValue(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-sm text-gray-600">
              Previous Year: {formatValue(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRevenue ? (
              <DollarSign className="w-5 h-5 text-green-600" />
            ) : (
              <Target className="w-5 h-5 text-blue-600" />
            )}
            {isRevenue ? 'Revenue Trend' : 'CPA Trend'}
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' ? (
              <TrendingUp className={`w-4 h-4 ${isRevenue ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <TrendingDown className={`w-4 h-4 ${isRevenue ? 'text-red-600' : 'text-green-600'}`} />
            )}
            <span className={`text-sm font-medium ${
              (isRevenue && trend === 'up') || (!isRevenue && trend === 'down') 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {trendPercent.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
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
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
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
        <div className="mt-4 text-xs text-gray-500 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRevenue ? 'bg-green-500' : 'bg-blue-500'}`} />
            Current Year
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-gray-400" />
            Previous Year (Comparison)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;
