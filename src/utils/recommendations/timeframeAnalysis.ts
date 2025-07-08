
import { ProductData } from '@/contexts/DataContext';
import { TimeframeAnalysis, TimeframeMetrics } from '@/types/recommendations';

export const analyzeTimeframe = (
  filteredData: ProductData[],
  allData: ProductData[]
): TimeframeAnalysis => {
  if (filteredData.length === 0) {
    return {
      timeframeMetrics: {
        avgRevenue: 0,
        totalRevenue: 0,
        avgProfit: 0,
        avgProfitMargin: 0,
        avgCpa: 0,
        totalOrders: 0,
        monthCount: 0,
        revenueGrowthRate: 0,
        bestMonth: filteredData[0],
        worstMonth: filteredData[0],
        consistencyScore: 0
      },
      trendDirection: 'stable',
      seasonalPatterns: [],
      performanceConsistency: 'low'
    };
  }

  // Sort data chronologically
  const sortedData = [...filteredData].sort((a, b) => a.month.localeCompare(b.month));
  
  // Calculate timeframe metrics
  const totalRevenue = sortedData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / sortedData.length;
  
  const profits = sortedData.map(item => {
    const costs = item.adSpend + item.nonAdCosts + item.thirdPartyCosts;
    return item.revenue - costs;
  });
  const avgProfit = profits.reduce((sum, profit) => sum + profit, 0) / profits.length;
  const avgProfitMargin = avgRevenue > 0 ? (avgProfit / avgRevenue) * 100 : 0;
  
  const cpas = sortedData.map(item => {
    const costs = item.adSpend + item.nonAdCosts + item.thirdPartyCosts;
    return item.orders > 0 ? costs / item.orders : 0;
  }).filter(cpa => cpa > 0);
  const avgCpa = cpas.length > 0 ? cpas.reduce((sum, cpa) => sum + cpa, 0) / cpas.length : 0;
  
  const totalOrders = sortedData.reduce((sum, item) => sum + item.orders, 0);
  
  // Find best and worst performing months
  const bestMonth = sortedData.reduce((best, current) => 
    current.revenue > best.revenue ? current : best
  );
  const worstMonth = sortedData.reduce((worst, current) => 
    current.revenue < worst.revenue ? current : worst
  );
  
  // Calculate revenue growth rate (first month vs last month)
  const revenueGrowthRate = sortedData.length > 1 
    ? ((sortedData[sortedData.length - 1].revenue - sortedData[0].revenue) / sortedData[0].revenue) * 100
    : 0;
  
  // Calculate consistency score (lower coefficient of variation = higher consistency)
  const revenueStdDev = Math.sqrt(
    sortedData.reduce((sum, item) => sum + Math.pow(item.revenue - avgRevenue, 2), 0) / sortedData.length
  );
  const coefficientOfVariation = avgRevenue > 0 ? revenueStdDev / avgRevenue : 1;
  const consistencyScore = Math.max(0, 100 - (coefficientOfVariation * 100));
  
  const timeframeMetrics: TimeframeMetrics = {
    avgRevenue,
    totalRevenue,
    avgProfit,
    avgProfitMargin,
    avgCpa,
    totalOrders,
    monthCount: sortedData.length,
    revenueGrowthRate,
    bestMonth,
    worstMonth,
    consistencyScore
  };
  
  // Determine trend direction
  const trendDirection = (() => {
    if (Math.abs(revenueGrowthRate) < 5) return 'stable';
    return revenueGrowthRate > 0 ? 'improving' : 'declining';
  })();
  
  // Analyze seasonal patterns
  const seasonalPatterns = analyzeSeasonalPatterns(sortedData, allData);
  
  // Determine performance consistency
  const performanceConsistency = (() => {
    if (consistencyScore > 80) return 'high';
    if (consistencyScore > 60) return 'medium';
    return 'low';
  })() as 'high' | 'medium' | 'low';
  
  return {
    timeframeMetrics,
    trendDirection,
    seasonalPatterns,
    performanceConsistency
  };
};

const analyzeSeasonalPatterns = (filteredData: ProductData[], allData: ProductData[]): string[] => {
  const patterns: string[] = [];
  
  if (filteredData.length < 3) return patterns;
  
  // Group by month (01, 02, etc.) to find seasonal patterns
  const monthlyPerformance = new Map<string, number[]>();
  
  allData.forEach(item => {
    const month = item.month.split('-')[1]; // Extract month part
    if (!monthlyPerformance.has(month)) {
      monthlyPerformance.set(month, []);
    }
    monthlyPerformance.get(month)!.push(item.revenue);
  });
  
  // Calculate average revenue by month
  const monthlyAverages = new Map<string, number>();
  monthlyPerformance.forEach((revenues, month) => {
    const avg = revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length;
    monthlyAverages.set(month, avg);
  });
  
  // Find strongest and weakest months
  const sortedMonths = Array.from(monthlyAverages.entries())
    .sort(([,a], [,b]) => b - a);
    
  if (sortedMonths.length >= 2) {
    const strongestMonth = sortedMonths[0];
    const weakestMonth = sortedMonths[sortedMonths.length - 1];
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (strongestMonth[1] > weakestMonth[1] * 1.2) {
      patterns.push(`${monthNames[parseInt(strongestMonth[0]) - 1]} typically performs ${((strongestMonth[1] / weakestMonth[1] - 1) * 100).toFixed(0)}% better than ${monthNames[parseInt(weakestMonth[0]) - 1]}`);
    }
  }
  
  return patterns;
};
