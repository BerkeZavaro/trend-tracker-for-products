
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { normalizeDate } from '@/utils/chartUtils';
import { MetricDataPoint } from './useDynamicChartData';

export const usePortfolioChartData = (timeFrame: { start: string; end: string }) => {
  const { uploadedData, isDataLoaded } = useData();

  const generatePortfolioChartData = (): MetricDataPoint[] => {
    if (!isDataLoaded) return [];

    // Filter data for the selected time frame
    const filteredData = uploadedData.filter(item => 
      isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData)
    );

    // Group data by month and aggregate across all products
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

      chartData.push({
        month: monthLabel,
        revenue: data.revenue,
        adSpend: data.adSpend,
        totalCost,
        orders: data.orders,
        adjustedCpa,
        avgOrderValue,
        profit
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
