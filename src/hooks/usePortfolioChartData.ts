
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { normalizeDate } from '@/utils/chartUtils';
import { MetricDataPoint } from './useDynamicChartData';
import { ComparisonConfig } from '@/types/comparisonTypes';
import { getComparisonPeriod } from '@/utils/comparisonUtils';

export const usePortfolioChartData = (
  timeFrame: { start: string; end: string },
  comparisonConfig: ComparisonConfig = { type: 'none' }
) => {
  const { uploadedData, isDataLoaded } = useData();

  const generatePortfolioChartData = (): MetricDataPoint[] => {
    if (!isDataLoaded) return [];

    // Filter data for the selected time frame
    const filteredData = uploadedData.filter(item => 
      isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData)
    );

    // Get comparison period data based on configuration
    let comparisonData: any[] = [];
    const comparisonPeriod = getComparisonPeriod(timeFrame.start, timeFrame.end, comparisonConfig);
    
    if (comparisonPeriod) {
      comparisonData = uploadedData.filter(item => 
        isDateInRange(item.month, comparisonPeriod.start, comparisonPeriod.end, uploadedData)
      );
    }

    console.log('Portfolio Chart Data Generation:', {
      comparisonType: comparisonConfig.type,
      mainPeriod: timeFrame,
      comparisonPeriod,
      mainDataPoints: filteredData.length,
      comparisonDataPoints: comparisonData.length
    });

    // Group current period data by month
    const monthlyData = new Map<string, {
      revenue: number;
      adSpend: number;
      nonAdCosts: number;
      thirdPartyCosts: number;
      orders: number;
      adjustedCpaSum: number;
      adjustedCpaCount: number;
    }>();

    filteredData.forEach(item => {
      const normalizedDate = normalizeDate(item.month, uploadedData);
      
      if (!monthlyData.has(normalizedDate)) {
        monthlyData.set(normalizedDate, {
          revenue: 0,
          adSpend: 0,
          nonAdCosts: 0,
          thirdPartyCosts: 0,
          orders: 0,
          adjustedCpaSum: 0,
          adjustedCpaCount: 0
        });
      }

      const monthData = monthlyData.get(normalizedDate)!;
      monthData.revenue += item.revenue || 0;
      monthData.adSpend += item.adSpend || 0;
      monthData.nonAdCosts += item.nonAdCosts || 0;
      monthData.thirdPartyCosts += item.thirdPartyCosts || 0;
      monthData.orders += item.orders || 0;
      
      if (item.adjustedCpa > 0) {
        monthData.adjustedCpaSum += item.adjustedCpa;
        monthData.adjustedCpaCount += 1;
      }
    });

    // Group comparison period data by month
    const comparisonMonthlyData = new Map<string, {
      revenue: number;
      adSpend: number;
      nonAdCosts: number;
      thirdPartyCosts: number;
      orders: number;
      adjustedCpaSum: number;
      adjustedCpaCount: number;
    }>();

    comparisonData.forEach(item => {
      const normalizedDate = normalizeDate(item.month, uploadedData);
      
      if (!comparisonMonthlyData.has(normalizedDate)) {
        comparisonMonthlyData.set(normalizedDate, {
          revenue: 0,
          adSpend: 0,
          nonAdCosts: 0,
          thirdPartyCosts: 0,
          orders: 0,
          adjustedCpaSum: 0,
          adjustedCpaCount: 0
        });
      }

      const monthData = comparisonMonthlyData.get(normalizedDate)!;
      monthData.revenue += item.revenue || 0;
      monthData.adSpend += item.adSpend || 0;
      monthData.nonAdCosts += item.nonAdCosts || 0;
      monthData.thirdPartyCosts += item.thirdPartyCosts || 0;
      monthData.orders += item.orders || 0;
      
      if (item.adjustedCpa > 0) {
        monthData.adjustedCpaSum += item.adjustedCpa;
        monthData.adjustedCpaCount += 1;
      }
    });

    // Convert to chart data format
    const chartData: MetricDataPoint[] = [];
    const sortedDates = Array.from(monthlyData.keys()).sort();
    const sortedComparisonDates = Array.from(comparisonMonthlyData.keys()).sort();

    sortedDates.forEach((date, index) => {
      const [year, month] = date.split('-');
      const monthLabel = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });

      const data = monthlyData.get(date)!;
      const totalCost = data.adSpend + data.nonAdCosts + data.thirdPartyCosts;
      const avgOrderValue = data.orders > 0 ? data.revenue / data.orders : 0;
      const adjustedCpa = data.adjustedCpaCount > 0 ? data.adjustedCpaSum / data.adjustedCpaCount : 0;
      const profit = data.revenue - totalCost;

      // Get comparison data
      let comparisonMetrics: MetricDataPoint['comparison'] = undefined;
      if (comparisonConfig.type !== 'none' && comparisonData.length > 0) {
        let comparisonDate: string | null = null;
        
        if (comparisonConfig.type === 'previousYear') {
          const prevYear = parseInt(year) - 1;
          comparisonDate = `${prevYear}-${month}`;
        } else if (comparisonConfig.type === 'precedingPeriod' || comparisonConfig.type === 'customRange') {
          // For preceding period and custom range, align by index
          if (index < sortedComparisonDates.length) {
            comparisonDate = sortedComparisonDates[index];
          }
        }

        if (comparisonDate && comparisonMonthlyData.has(comparisonDate)) {
          const compData = comparisonMonthlyData.get(comparisonDate)!;
          const compTotalCost = compData.adSpend + compData.nonAdCosts + compData.thirdPartyCosts;
          const compAvgOrderValue = compData.orders > 0 ? compData.revenue / compData.orders : 0;
          const compAdjustedCpa = compData.adjustedCpaCount > 0 ? compData.adjustedCpaSum / compData.adjustedCpaCount : 0;
          const compProfit = compData.revenue - compTotalCost;

          comparisonMetrics = {
            revenue: compData.revenue,
            adSpend: compData.adSpend,
            totalCost: compTotalCost,
            orders: compData.orders,
            adjustedCpa: compAdjustedCpa,
            avgOrderValue: compAvgOrderValue,
            profit: compProfit
          };
        }
      }

      chartData.push({
        month: monthLabel,
        revenue: data.revenue,
        adSpend: data.adSpend,
        totalCost,
        orders: data.orders,
        adjustedCpa,
        avgOrderValue,
        profit,
        comparison: comparisonMetrics
      });
    });

    return chartData;
  };

  const data = generatePortfolioChartData();

  return {
    data,
    hasData: data.length > 0
  };
};
