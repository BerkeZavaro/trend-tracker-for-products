
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { normalizeDate } from '@/utils/chartUtils';
import { MetricDataPoint } from './useDynamicChartData';

export const usePortfolioChartData = (timeFrame: { start: string; end: string }) => {
  const { uploadedData, isDataLoaded } = useData();

  const calculatePreviousPeriod = () => {
    const startDate = new Date(timeFrame.start + '-01');
    const endDate = new Date(timeFrame.end + '-01');
    const periodLength = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth()) + 1;
    
    const previousEndDate = new Date(startDate);
    previousEndDate.setMonth(previousEndDate.getMonth() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setMonth(previousStartDate.getMonth() - periodLength + 1);
    
    return {
      start: previousStartDate.toISOString().slice(0, 7),
      end: previousEndDate.toISOString().slice(0, 7)
    };
  };

  const generatePortfolioChartData = (): MetricDataPoint[] => {
    if (!isDataLoaded) return [];

    // Filter data for the selected time frame
    const filteredData = uploadedData.filter(item => 
      isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData)
    );

    // Get previous period data
    const previousPeriod = calculatePreviousPeriod();
    const previousPeriodData = uploadedData.filter(item => 
      isDateInRange(item.month, previousPeriod.start, previousPeriod.end, uploadedData)
    );

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

    // Group previous period data by month
    const previousMonthlyData = new Map<string, {
      revenue: number;
      adSpend: number;
      nonAdCosts: number;
      thirdPartyCosts: number;
      orders: number;
      adjustedCpaSum: number;
      adjustedCpaCount: number;
    }>();

    previousPeriodData.forEach(item => {
      const normalizedDate = normalizeDate(item.month, uploadedData);
      
      if (!previousMonthlyData.has(normalizedDate)) {
        previousMonthlyData.set(normalizedDate, {
          revenue: 0,
          adSpend: 0,
          nonAdCosts: 0,
          thirdPartyCosts: 0,
          orders: 0,
          adjustedCpaSum: 0,
          adjustedCpaCount: 0
        });
      }

      const monthData = previousMonthlyData.get(normalizedDate)!;
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

    sortedDates.forEach(date => {
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

      // Calculate previous year data for the same month
      const previousYearDate = new Date(parseInt(year) - 1, parseInt(month) - 1);
      const previousYearKey = previousYearDate.toISOString().slice(0, 7);
      const previousData = previousMonthlyData.get(previousYearKey);

      let previousYear = null;
      if (previousData) {
        const prevTotalCost = previousData.adSpend + previousData.nonAdCosts + previousData.thirdPartyCosts;
        const prevAvgOrderValue = previousData.orders > 0 ? previousData.revenue / previousData.orders : 0;
        const prevAdjustedCpa = previousData.adjustedCpaCount > 0 ? previousData.adjustedCpaSum / previousData.adjustedCpaCount : 0;
        const prevProfit = previousData.revenue - prevTotalCost;

        previousYear = {
          revenue: previousData.revenue,
          adSpend: previousData.adSpend,
          totalCost: prevTotalCost,
          orders: previousData.orders,
          adjustedCpa: prevAdjustedCpa,
          avgOrderValue: prevAvgOrderValue,
          profit: prevProfit
        };
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
        previousYear
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
