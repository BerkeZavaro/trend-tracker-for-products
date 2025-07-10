
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { normalizeDate, calculateTrend } from '@/utils/chartUtils';

export interface ChartDataPoint {
  month: string;
  value: number;
  previousYear: number | null;
  averageSale?: number;
  previousYearAverageSale?: number | null;
  saleCpaDifference?: number;
}

export const useTrendChartData = (
  productId: string,
  timeFrame: { start: string; end: string },
  metric: 'revenue' | 'cpa'
) => {
  const { getProductData, uploadedData } = useData();
  const productData = getProductData(productId);

  // Filter data for the selected time frame
  const filteredData = productData.filter(item => 
    isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData)
  );

  // Create a lookup map for all data by normalized date
  const dataByDate = new Map();
  productData.forEach(item => {
    const normalizedDate = normalizeDate(item.month, uploadedData);
    dataByDate.set(normalizedDate, item);
  });

  // Generate chart data
  const generateChartData = (): ChartDataPoint[] => {
    const chartData: ChartDataPoint[] = [];

    // Sort filtered data by normalized date
    const sortedData = [...filteredData].sort((a, b) => {
      const aDate = normalizeDate(a.month, uploadedData);
      const bDate = normalizeDate(b.month, uploadedData);
      return aDate.localeCompare(bDate);
    });

    sortedData.forEach(item => {
      const normalizedDate = normalizeDate(item.month, uploadedData);
      const [year, month] = normalizedDate.split('-');
      
      // Create display label
      const monthLabel = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });

      // Calculate current value
      let value = 0;
      let averageSale: number | undefined;
      let saleCpaDifference: number | undefined;
      
      if (metric === 'revenue') {
        value = item.revenue || 0;
      } else {
        // Calculate CPA: total costs / orders
        const totalCosts = (item.adSpend || 0) + (item.nonAdCosts || 0) + (item.thirdPartyCosts || 0);
        value = item.orders > 0 ? totalCosts / item.orders : 0;
        
        // Calculate average sale for CPA charts
        averageSale = item.orders > 0 ? (item.revenue || 0) / item.orders : 0;
        
        // Calculate the difference between average sale and CPA for area filling
        // Only positive differences (when avg sale > CPA) should be filled
        saleCpaDifference = averageSale > value ? averageSale - value : 0;
      }

      // Find previous year data
      const previousYear = parseInt(year) - 1;
      const previousYearDate = `${previousYear}-${month}`;
      const previousYearItem = dataByDate.get(previousYearDate);
      
      let previousYearValue: number | null = null;
      let previousYearAverageSale: number | null = null;
      
      if (previousYearItem) {
        if (metric === 'revenue') {
          previousYearValue = previousYearItem.revenue || 0;
        } else {
          const prevTotalCosts = (previousYearItem.adSpend || 0) + (previousYearItem.nonAdCosts || 0) + (previousYearItem.thirdPartyCosts || 0);
          previousYearValue = previousYearItem.orders > 0 ? prevTotalCosts / previousYearItem.orders : 0;
          
          // Calculate previous year average sale
          previousYearAverageSale = previousYearItem.orders > 0 ? (previousYearItem.revenue || 0) / previousYearItem.orders : 0;
        }
      }

      chartData.push({
        month: monthLabel,
        value,
        previousYear: previousYearValue,
        averageSale,
        previousYearAverageSale,
        saleCpaDifference
      });
    });

    return chartData;
  };

  const data = generateChartData();
  const { trend, trendPercent } = calculateTrend(data, timeFrame);

  return {
    data,
    trend,
    trendPercent,
    hasData: data.length > 0
  };
};
