
import { ProductData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';

export interface TimeSeriesAnalysis {
  monthToMonth: Array<{
    month: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  }>;
  yearOverYear: Array<{
    month: string;
    current: number;
    previousYear: number;
    change: number;
    changePercent: number;
  }>;
  trends: {
    revenueDirection: 'up' | 'down' | 'stable';
    profitDirection: 'up' | 'down' | 'stable';
    efficiencyDirection: 'up' | 'down' | 'stable';
    momentum: 'accelerating' | 'decelerating' | 'steady';
  };
  seasonality: {
    bestMonths: string[];
    worstMonths: string[];
    isSeasonalBusiness: boolean;
  };
}

export const analyzeTimeSeries = (
  filteredData: ProductData[],
  allData: ProductData[],
  uploadedData: ProductData[]
): TimeSeriesAnalysis => {
  // Sort data chronologically
  const sortedFiltered = [...filteredData].sort((a, b) => {
    const aDate = new Date(a.month + '-01');
    const bDate = new Date(b.month + '-01');
    return aDate.getTime() - bDate.getTime();
  });

  // Month-to-month analysis
  const monthToMonth = sortedFiltered.map((item, index) => {
    const previous = index > 0 ? sortedFiltered[index - 1] : null;
    const currentRevenue = item.revenue || 0;
    const previousRevenue = previous?.revenue || 0;
    
    return {
      month: item.month,
      current: currentRevenue,
      previous: previousRevenue,
      change: currentRevenue - previousRevenue,
      changePercent: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
    };
  });

  // Year-over-year analysis
  const yearOverYear = sortedFiltered.map(item => {
    const [year, month] = item.month.split('-');
    const previousYear = `${parseInt(year) - 1}-${month}`;
    const previousYearItem = allData.find(d => d.month === previousYear);
    
    const currentRevenue = item.revenue || 0;
    const previousYearRevenue = previousYearItem?.revenue || 0;
    
    return {
      month: item.month,
      current: currentRevenue,
      previousYear: previousYearRevenue,
      change: currentRevenue - previousYearRevenue,
      changePercent: previousYearRevenue > 0 ? ((currentRevenue - previousYearRevenue) / previousYearRevenue) * 100 : 0
    };
  });

  // Calculate trends
  const recentMonths = sortedFiltered.slice(-3);
  const earlierMonths = sortedFiltered.slice(0, 3);
  
  const recentAvgRevenue = recentMonths.reduce((sum, item) => sum + item.revenue, 0) / recentMonths.length;
  const earlierAvgRevenue = earlierMonths.reduce((sum, item) => sum + item.revenue, 0) / earlierMonths.length;
  
  const revenueDirection = recentAvgRevenue > earlierAvgRevenue * 1.05 ? 'up' : 
                         recentAvgRevenue < earlierAvgRevenue * 0.95 ? 'down' : 'stable';

  // Calculate profit trends
  const recentAvgProfit = recentMonths.reduce((sum, item) => {
    const totalCosts = item.adSpend + item.nonAdCosts + item.thirdPartyCosts;
    return sum + (item.revenue - totalCosts);
  }, 0) / recentMonths.length;
  
  const earlierAvgProfit = earlierMonths.reduce((sum, item) => {
    const totalCosts = item.adSpend + item.nonAdCosts + item.thirdPartyCosts;
    return sum + (item.revenue - totalCosts);
  }, 0) / earlierMonths.length;
  
  const profitDirection = recentAvgProfit > earlierAvgProfit * 1.05 ? 'up' : 
                         recentAvgProfit < earlierAvgProfit * 0.95 ? 'down' : 'stable';

  // Calculate efficiency (CPA trends)
  const recentAvgCPA = recentMonths.reduce((sum, item) => {
    const totalCosts = item.adSpend + item.nonAdCosts + item.thirdPartyCosts;
    return sum + (item.orders > 0 ? totalCosts / item.orders : 0);
  }, 0) / recentMonths.length;
  
  const earlierAvgCPA = earlierMonths.reduce((sum, item) => {
    const totalCosts = item.adSpend + item.nonAdCosts + item.thirdPartyCosts;
    return sum + (item.orders > 0 ? totalCosts / item.orders : 0);
  }, 0) / earlierMonths.length;
  
  const efficiencyDirection = recentAvgCPA < earlierAvgCPA * 0.95 ? 'up' : 
                             recentAvgCPA > earlierAvgCPA * 1.05 ? 'down' : 'stable';

  // Calculate momentum
  const lastThreeChanges = monthToMonth.slice(-3).map(m => m.changePercent);
  const isAccelerating = lastThreeChanges.every((change, index) => 
    index === 0 || change >= lastThreeChanges[index - 1]
  );
  const isDecelerating = lastThreeChanges.every((change, index) => 
    index === 0 || change <= lastThreeChanges[index - 1]
  );
  
  const momentum = isAccelerating ? 'accelerating' : isDecelerating ? 'decelerating' : 'steady';

  // Seasonality analysis
  const monthlyPerformance = allData.reduce((acc, item) => {
    const [, month] = item.month.split('-');
    if (!acc[month]) acc[month] = [];
    acc[month].push(item.revenue);
    return acc;
  }, {} as Record<string, number[]>);

  const monthlyAvgs = Object.entries(monthlyPerformance).map(([month, revenues]) => ({
    month,
    avg: revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length
  })).sort((a, b) => b.avg - a.avg);

  const bestMonths = monthlyAvgs.slice(0, 3).map(m => m.month);
  const worstMonths = monthlyAvgs.slice(-3).map(m => m.month);
  
  const highestAvg = monthlyAvgs[0]?.avg || 0;
  const lowestAvg = monthlyAvgs[monthlyAvgs.length - 1]?.avg || 0;
  const isSeasonalBusiness = highestAvg > lowestAvg * 1.3;

  return {
    monthToMonth,
    yearOverYear,
    trends: {
      revenueDirection,
      profitDirection,
      efficiencyDirection,
      momentum
    },
    seasonality: {
      bestMonths,
      worstMonths,
      isSeasonalBusiness
    }
  };
};

export const generatePredictions = (analysis: TimeSeriesAnalysis): {
  nextMonthRevenue: number;
  confidence: 'high' | 'medium' | 'low';
  keyRisks: string[];
  opportunities: string[];
} => {
  const recentRevenues = analysis.monthToMonth.slice(-3).map(m => m.current);
  const avgRecent = recentRevenues.reduce((sum, rev) => sum + rev, 0) / recentRevenues.length;
  
  // Simple trend-based prediction
  const lastChangePercent = analysis.monthToMonth[analysis.monthToMonth.length - 1]?.changePercent || 0;
  const nextMonthRevenue = avgRecent * (1 + (lastChangePercent / 100) * 0.7); // Conservative estimate
  
  // Confidence based on trend consistency
  const recentChanges = analysis.monthToMonth.slice(-3).map(m => m.changePercent);
  const changeVariance = recentChanges.reduce((sum, change) => {
    const avg = recentChanges.reduce((s, c) => s + c, 0) / recentChanges.length;
    return sum + Math.pow(change - avg, 2);
  }, 0) / recentChanges.length;
  
  const confidence = changeVariance < 100 ? 'high' : changeVariance < 400 ? 'medium' : 'low';
  
  const keyRisks = [];
  const opportunities = [];
  
  if (analysis.trends.revenueDirection === 'down') {
    keyRisks.push('Revenue declining trend');
  }
  if (analysis.trends.profitDirection === 'down') {
    keyRisks.push('Profit margin compression');
  }
  if (analysis.trends.efficiencyDirection === 'down') {
    keyRisks.push('Increasing acquisition costs');
  }
  
  if (analysis.trends.momentum === 'accelerating') {
    opportunities.push('Positive momentum - consider scaling');
  }
  if (analysis.seasonality.isSeasonalBusiness) {
    opportunities.push('Seasonal patterns identified - optimize timing');
  }
  
  return {
    nextMonthRevenue,
    confidence,
    keyRisks,
    opportunities
  };
};
