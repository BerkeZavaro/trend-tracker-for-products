
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';

interface TrendChartProps {
  productId: string;
  timeFrame: { start: string; end: string };
  metric: 'revenue' | 'cpa';
}

const TrendChart = ({ productId, timeFrame, metric }: TrendChartProps) => {
  const { getProductData } = useData();
  const productData = getProductData(productId);

  console.log('=== TrendChart Debug ===');
  console.log('Product ID:', productId);
  console.log('Time Frame:', timeFrame);
  console.log('Metric:', metric);
  console.log('Raw product data length:', productData.length);
  console.log('Sample raw data:', productData.slice(0, 3));

  // Filter data for the selected time frame
  const filteredData = productData.filter(item => 
    isDateInRange(item.month, timeFrame.start, timeFrame.end)
  );

  console.log('Filtered data length:', filteredData.length);
  console.log('Filtered data sample:', filteredData.slice(0, 2));

  // Helper function to normalize date format to YYYY-MM
  const normalizeDate = (month: string): string => {
    if (month.match(/^\d{4}-\d{2}$/)) {
      return month; // Already in YYYY-MM format
    }
    
    if (month.match(/^\d{1,2}$/)) {
      const monthNum = parseInt(month);
      // Simple heuristic: assume months 1-6 are recent (2025), 7-12 are previous year (2024)
      const year = monthNum <= 6 ? 2025 : 2024;
      return `${year}-${monthNum.toString().padStart(2, '0')}`;
    }
    
    return month;
  };

  // Create a lookup map for all data by normalized date
  const dataByDate = new Map();
  productData.forEach(item => {
    const normalizedDate = normalizeDate(item.month);
    dataByDate.set(normalizedDate, item);
  });

  console.log('Data by date map size:', dataByDate.size);
  console.log('Available dates:', Array.from(dataByDate.keys()).sort());

  // Generate chart data
  const generateChartData = () => {
    const chartData: Array<{
      month: string;
      value: number;
      previousYear: number | null;
    }> = [];

    // Sort filtered data by normalized date
    const sortedData = [...filteredData].sort((a, b) => {
      const aDate = normalizeDate(a.month);
      const bDate = normalizeDate(b.month);
      return aDate.localeCompare(bDate);
    });

    console.log('Sorted data length:', sortedData.length);

    sortedData.forEach(item => {
      const normalizedDate = normalizeDate(item.month);
      const [year, month] = normalizedDate.split('-');
      
      // Create display label
      const monthLabel = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });

      // Calculate current value
      let value = 0;
      if (metric === 'revenue') {
        value = item.revenue || 0;
      } else {
        // Calculate CPA: total costs / orders
        const totalCosts = (item.adSpend || 0) + (item.nonAdCosts || 0) + (item.thirdPartyCosts || 0);
        value = item.orders > 0 ? totalCosts / item.orders : 0;
      }

      console.log(`Processing ${normalizedDate}: ${metric} = ${value}`);

      // Find previous year data
      const previousYear = parseInt(year) - 1;
      const previousYearDate = `${previousYear}-${month}`;
      const previousYearItem = dataByDate.get(previousYearDate);
      
      let previousYearValue: number | null = null;
      if (previousYearItem) {
        if (metric === 'revenue') {
          previousYearValue = previousYearItem.revenue || 0;
        } else {
          const prevTotalCosts = (previousYearItem.adSpend || 0) + (previousYearItem.nonAdCosts || 0) + (previousYearItem.thirdPartyCosts || 0);
          previousYearValue = previousYearItem.orders > 0 ? prevTotalCosts / previousYearItem.orders : 0;
        }
        console.log(`Found previous year data for ${previousYearDate}: ${previousYearValue}`);
      } else {
        console.log(`No previous year data found for ${previousYearDate}`);
      }

      chartData.push({
        month: monthLabel,
        value,
        previousYear: previousYearValue
      });
    });

    console.log('Final chart data:', chartData);
    return chartData;
  };

  const data = generateChartData();
  const isRevenue = metric === 'revenue';
  
  // Calculate trend
  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const trend = currentValue > previousValue ? 'up' : 'down';
  const trendPercent = previousValue > 0 ? Math.abs(((currentValue - previousValue) / previousValue) * 100) : 0;

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
          {payload[1] && payload[1].value !== null && (
            <p className="text-sm text-gray-600">
              Previous Year: {formatValue(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Don't render if no data
  if (data.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            {isRevenue ? (
              <DollarSign className="w-5 h-5 text-green-600" />
            ) : (
              <Target className="w-5 h-5 text-blue-600" />
            )}
            {isRevenue ? 'Revenue Trend' : 'CPA Trend'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available for the selected time frame
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {data.length > 1 && (
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
          )}
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
