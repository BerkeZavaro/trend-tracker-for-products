
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { normalizeDate } from '@/utils/chartUtils';

export interface MetricDataPoint {
  month: string;
  revenue: number;
  adSpend: number;
  totalCost: number;
  orders: number;
  cpa: number;
  avgOrderValue: number;
  previousYear?: {
    revenue?: number;
    adSpend?: number;
    totalCost?: number;
    orders?: number;
    cpa?: number;
    avgOrderValue?: number;
  };
}

export const useDynamicChartData = (
  productId: string,
  timeFrame: { start: string; end: string }
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

  // Generate chart data with all metrics
  const generateChartData = (): MetricDataPoint[] => {
    const chartData: MetricDataPoint[] = [];

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

      // Calculate current metrics
      const revenue = item.revenue || 0;
      const adSpend = item.adSpend || 0;
      const totalCost = (item.adSpend || 0) + (item.nonAdCosts || 0) + (item.thirdPartyCosts || 0);
      const orders = item.orders || 0;
      const cpa = orders > 0 ? totalCost / orders : 0;
      const avgOrderValue = orders > 0 ? revenue / orders : 0;

      // Find previous year data
      const previousYear = parseInt(year) - 1;
      const previousYearDate = `${previousYear}-${month}`;
      const previousYearItem = dataByDate.get(previousYearDate);
      
      let previousYearData: MetricDataPoint['previousYear'] = {};
      
      if (previousYearItem) {
        const prevRevenue = previousYearItem.revenue || 0;
        const prevAdSpend = previousYearItem.adSpend || 0;
        const prevTotalCost = (previousYearItem.adSpend || 0) + (previousYearItem.nonAdCosts || 0) + (previousYearItem.thirdPartyCosts || 0);
        const prevOrders = previousYearItem.orders || 0;
        const prevCpa = prevOrders > 0 ? prevTotalCost / prevOrders : 0;
        const prevAvgOrderValue = prevOrders > 0 ? prevRevenue / prevOrders : 0;

        previousYearData = {
          revenue: prevRevenue,
          adSpend: prevAdSpend,
          totalCost: prevTotalCost,
          orders: prevOrders,
          cpa: prevCpa,
          avgOrderValue: prevAvgOrderValue
        };
      }

      chartData.push({
        month: monthLabel,
        revenue,
        adSpend,
        totalCost,
        orders,
        cpa,
        avgOrderValue,
        previousYear: previousYearData
      });
    });

    return chartData;
  };

  const data = generateChartData();

  return {
    data,
    hasData: data.length > 0
  };
};
