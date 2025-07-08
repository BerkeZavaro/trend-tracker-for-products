
import { ProductData } from '@/contexts/DataContext';
import { LastMonthAnalysis, LastMonthMetrics, MonthOverMonthChange } from '@/types/recommendations';

export const analyzeLastMonth = (
  filteredData: ProductData[],
  allData: ProductData[]
): LastMonthAnalysis => {
  if (filteredData.length === 0) {
    return {
      lastMonth: null,
      lastMonthMetrics: {
        revenue: 0,
        totalCosts: 0,
        profit: 0,
        profitMargin: 0,
        adjustedCpa: 0,
        avgSale: 0,
        orders: 0
      },
      previousMonth: null,
      monthOverMonthChange: {
        revenue: 0,
        profit: 0,
        adjustedCpa: 0,
        orders: 0
      },
      isOutlier: false,
      outlierReason: ''
    };
  }

  // Sort by date to get the actual last month
  const sortedData = [...filteredData].sort((a, b) => a.month.localeCompare(b.month));
  const lastMonth = sortedData[sortedData.length - 1];
  const previousMonth = sortedData.length > 1 ? sortedData[sortedData.length - 2] : null;

  // Calculate last month metrics
  const totalCosts = lastMonth.adSpend + lastMonth.nonAdCosts + lastMonth.thirdPartyCosts;
  const profit = lastMonth.revenue - totalCosts;
  const profitMargin = lastMonth.revenue > 0 ? (profit / lastMonth.revenue) * 100 : 0;
  const avgSale = lastMonth.orders > 0 ? lastMonth.revenue / lastMonth.orders : 0;

  const lastMonthMetrics: LastMonthMetrics = {
    revenue: lastMonth.revenue,
    totalCosts,
    profit,
    profitMargin,
    adjustedCpa: lastMonth.adjustedCpa,
    avgSale,
    orders: lastMonth.orders
  };

  // Calculate month-over-month changes
  const monthOverMonthChange: MonthOverMonthChange = {
    revenue: previousMonth ? ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0,
    profit: previousMonth ? ((profit - (previousMonth.revenue - (previousMonth.adSpend + previousMonth.nonAdCosts + previousMonth.thirdPartyCosts))) / (previousMonth.revenue - (previousMonth.adSpend + previousMonth.nonAdCosts + previousMonth.thirdPartyCosts))) * 100 : 0,
    adjustedCpa: previousMonth && previousMonth.adjustedCpa > 0 ? ((lastMonth.adjustedCpa - previousMonth.adjustedCpa) / previousMonth.adjustedCpa) * 100 : 0,
    orders: previousMonth ? ((lastMonth.orders - previousMonth.orders) / previousMonth.orders) * 100 : 0
  };

  // Check if last month is an outlier compared to timeframe average
  const timeframeAvgRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0) / filteredData.length;
  const revenueDeviation = Math.abs((lastMonth.revenue - timeframeAvgRevenue) / timeframeAvgRevenue) * 100;
  
  let isOutlier = false;
  let outlierReason = '';
  
  if (revenueDeviation > 50) {
    isOutlier = true;
    outlierReason = `Last month revenue (${lastMonth.revenue.toLocaleString()}) deviates ${revenueDeviation.toFixed(1)}% from timeframe average (${timeframeAvgRevenue.toLocaleString()})`;
  }

  // Check seasonality patterns from historical data
  const [year, month] = lastMonth.month.split('-');
  const sameMonthHistorical = allData.filter(item => item.month.endsWith(`-${month}`) && item.month !== lastMonth.month);
  
  if (sameMonthHistorical.length > 0) {
    const historicalAvg = sameMonthHistorical.reduce((sum, item) => sum + item.revenue, 0) / sameMonthHistorical.length;
    const seasonalDeviation = Math.abs((lastMonth.revenue - historicalAvg) / historicalAvg) * 100;
    
    if (seasonalDeviation > 30 && !isOutlier) {
      isOutlier = true;
      outlierReason = `Last month performance differs ${seasonalDeviation.toFixed(1)}% from historical ${month} average`;
    }
  }

  return {
    lastMonth,
    lastMonthMetrics,
    previousMonth,
    monthOverMonthChange,
    isOutlier,
    outlierReason
  };
};
