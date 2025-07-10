
import { ProductData } from '@/contexts/DataContext';
import { LastMonthAnalysis, LastMonthMetrics, MonthOverMonthChange } from '@/types/recommendations';
import { smartNormalizeDate } from '@/utils/enhancedDateUtils';

export const analyzeLastMonth = (
  filteredData: ProductData[],
  allData: ProductData[]
): LastMonthAnalysis => {
  console.log('=== Last Month Analysis Debug ===');
  console.log('Filtered data length:', filteredData.length);
  console.log('All data length:', allData.length);
  
  if (allData.length === 0) {
    console.log('No data available at all');
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

  // Find the actual last month from ALL DATA, not just filtered data
  const normalizedAllData = allData.map(item => ({
    ...item,
    normalizedMonth: smartNormalizeDate(item.month, allData)
  }));
  
  console.log('Sample normalized dates:', normalizedAllData.slice(0, 3).map(item => 
    ({ original: item.month, normalized: item.normalizedMonth }))
  );
  
  // Sort by normalized date to get the actual last month from complete dataset
  const sortedAllData = [...normalizedAllData].sort((a, b) => 
    a.normalizedMonth.localeCompare(b.normalizedMonth)
  );
  
  const actualLastMonth = sortedAllData[sortedAllData.length - 1];
  const actualPreviousMonth = sortedAllData.length > 1 ? sortedAllData[sortedAllData.length - 2] : null;
  
  console.log('Actual last month from all data:', actualLastMonth.month, '(normalized:', actualLastMonth.normalizedMonth, ')');
  console.log('Actual previous month from all data:', actualPreviousMonth?.month, '(normalized:', actualPreviousMonth?.normalizedMonth, ')');
  
  // Check if the actual last month is within our filtered timeframe
  const lastMonthInFilteredData = filteredData.find(item => item.month === actualLastMonth.month);
  
  if (!lastMonthInFilteredData) {
    console.log('Actual last month is outside selected timeframe - using filtered data last month for analysis');
    
    // If actual last month is outside timeframe, use the last month from filtered data for analysis
    const normalizedFilteredData = filteredData.map(item => ({
      ...item,
      normalizedMonth: smartNormalizeDate(item.month, allData)
    }));
    
    const sortedFilteredData = [...normalizedFilteredData].sort((a, b) => 
      a.normalizedMonth.localeCompare(b.normalizedMonth)
    );
    
    if (sortedFilteredData.length === 0) {
      console.log('No filtered data available');
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
        outlierReason: `Analysis based on timeframe data. Actual last month (${actualLastMonth.month}) is outside selected timeframe.`
      };
    }
    
    const lastMonth = sortedFilteredData[sortedFilteredData.length - 1];
    const previousMonth = sortedFilteredData.length > 1 ? sortedFilteredData[sortedFilteredData.length - 2] : null;
    
    console.log('Using filtered data last month:', lastMonth.month);
    console.log('Using filtered data previous month:', previousMonth?.month);
    
    return calculateMetricsAndAnalysis(lastMonth, previousMonth, filteredData, allData, true, actualLastMonth.month);
  } else {
    console.log('Actual last month is within timeframe - using actual last month');
    return calculateMetricsAndAnalysis(actualLastMonth, actualPreviousMonth, filteredData, allData, false, null);
  }
};

const calculateMetricsAndAnalysis = (
  lastMonth: ProductData,
  previousMonth: ProductData | null,
  filteredData: ProductData[],
  allData: ProductData[],
  isTimeframeLimited: boolean,
  actualLastMonthDate: string | null
): LastMonthAnalysis => {
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
  
  if (isTimeframeLimited && actualLastMonthDate) {
    outlierReason = `Analysis based on timeframe data. Actual dataset last month (${actualLastMonthDate}) is outside selected timeframe.`;
  } else if (revenueDeviation > 50) {
    isOutlier = true;
    outlierReason = `Last month revenue (${lastMonth.revenue.toLocaleString()}) deviates ${revenueDeviation.toFixed(1)}% from timeframe average (${timeframeAvgRevenue.toLocaleString()})`;
  }

  // Check seasonality patterns from historical data
  const normalizedLastMonth = smartNormalizeDate(lastMonth.month, allData);
  const [year, month] = normalizedLastMonth.split('-');
  const sameMonthHistorical = allData.filter(item => {
    const normalizedItemMonth = smartNormalizeDate(item.month, allData);
    return normalizedItemMonth.endsWith(`-${month}`) && normalizedItemMonth !== normalizedLastMonth;
  });
  
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
