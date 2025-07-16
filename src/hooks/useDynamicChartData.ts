
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { normalizeDate } from '@/utils/chartUtils';
import { ComparisonConfig } from '@/types/comparisonTypes';
import { getComparisonPeriod, formatComparisonMonth } from '@/utils/comparisonUtils';

export interface MetricDataPoint {
  month: string;
  revenue: number;
  adSpend: number;
  totalCost: number;
  orders: number;
  adjustedCpa: number;
  avgOrderValue: number;
  profit: number;
  comparison?: {
    revenue?: number;
    adSpend?: number;
    totalCost?: number;
    orders?: number;
    adjustedCpa?: number;
    avgOrderValue?: number;
    profit?: number;
  };
  comparisonMonth?: string;
}

export const useDynamicChartData = (
  productId: string,
  timeFrame: { start: string; end: string },
  comparisonConfig: ComparisonConfig = { type: 'none' }
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

  // Get comparison period data if comparison is enabled
  const comparisonPeriod = comparisonConfig.type !== 'none' 
    ? getComparisonPeriod(timeFrame.start, timeFrame.end, comparisonConfig)
    : null;

  let comparisonData: any[] = [];
  if (comparisonPeriod) {
    comparisonData = productData.filter(item => 
      isDateInRange(item.month, comparisonPeriod.start, comparisonPeriod.end, uploadedData)
    );
  }

  // Generate chart data with all metrics
  const generateChartData = (): MetricDataPoint[] => {
    const chartData: MetricDataPoint[] = [];

    // Sort filtered data by normalized date
    const sortedData = [...filteredData].sort((a, b) => {
      const aDate = normalizeDate(a.month, uploadedData);
      const bDate = normalizeDate(b.month, uploadedData);
      return aDate.localeCompare(bDate);
    });

    // Sort comparison data for proper alignment
    const sortedComparisonData = [...comparisonData].sort((a, b) => {
      const aDate = normalizeDate(a.month, uploadedData);
      const bDate = normalizeDate(b.month, uploadedData);
      return aDate.localeCompare(bDate);
    });

    console.log('Product Chart Data Generation:', {
      comparisonType: comparisonConfig.type,
      mainPeriod: timeFrame,
      comparisonPeriod,
      mainDataPoints: sortedData.length,
      comparisonDataPoints: sortedComparisonData.length
    });

    sortedData.forEach((item, index) => {
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
      const adjustedCpa = item.adjustedCpa || 0;
      const avgOrderValue = orders > 0 ? revenue / orders : 0;
      const profit = revenue - totalCost;

      // Find comparison data based on comparison type
      let comparisonItem = null;
      let comparisonMonthLabel = '';
      
      if (comparisonConfig.type === 'previousYear') {
        // Previous year logic
        const previousYear = parseInt(year) - 1;
        const previousYearDate = `${previousYear}-${month}`;
        comparisonItem = dataByDate.get(previousYearDate);
        if (comparisonItem) {
          comparisonMonthLabel = formatComparisonMonth(previousYearDate);
        }
      } else if (comparisonPeriod && comparisonConfig.type !== 'none') {
        // For preceding period or custom range, align by index
        if (index < sortedComparisonData.length) {
          comparisonItem = sortedComparisonData[index];
          const comparisonNormalizedDate = normalizeDate(comparisonItem.month, uploadedData);
          comparisonMonthLabel = formatComparisonMonth(comparisonNormalizedDate);
        }
      }
      
      let comparisonMetrics: MetricDataPoint['comparison'] = undefined;
      
      if (comparisonItem) {
        const prevRevenue = comparisonItem.revenue || 0;
        const prevAdSpend = comparisonItem.adSpend || 0;
        const prevTotalCost = (comparisonItem.adSpend || 0) + (comparisonItem.nonAdCosts || 0) + (comparisonItem.thirdPartyCosts || 0);
        const prevOrders = comparisonItem.orders || 0;
        const prevAdjustedCpa = comparisonItem.adjustedCpa || 0;
        const prevAvgOrderValue = prevOrders > 0 ? prevRevenue / prevOrders : 0;
        const prevProfit = prevRevenue - prevTotalCost;

        comparisonMetrics = {
          revenue: prevRevenue,
          adSpend: prevAdSpend,
          totalCost: prevTotalCost,
          orders: prevOrders,
          adjustedCpa: prevAdjustedCpa,
          avgOrderValue: prevAvgOrderValue,
          profit: prevProfit
        };
      }

      chartData.push({
        month: monthLabel,
        revenue,
        adSpend,
        totalCost,
        orders,
        adjustedCpa,
        avgOrderValue,
        profit,
        comparison: comparisonMetrics,
        comparisonMonth: comparisonMonthLabel
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
