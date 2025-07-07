
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';

export const useMetricsCalculations = (productId: string, timeFrame: { start: string; end: string }) => {
  const { getProductData, isDataLoaded, uploadedData } = useData();

  const calculateMetrics = () => {
    if (!isDataLoaded || !productId) {
      return {
        totalRevenue: 0,
        totalCosts: 0,
        profit: 0,
        profitMargin: 0,
        totalOrders: 0,
        avgAdjustedCPA: 0,
        avgSale: 0,
        periodGrowth: 0,
        growthLabel: 'vs previous period',
        isProfitable: false
      };
    }

    const allProductData = getProductData(productId);
    
    // Filter data by time frame using enhanced date comparison
    const filteredData = allProductData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });
    
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalAdSpend = filteredData.reduce((sum, item) => sum + (item.adSpend || 0), 0);
    const totalNonAdCosts = filteredData.reduce((sum, item) => sum + (item.nonAdCosts || 0), 0);
    const totalThirdPartyCosts = filteredData.reduce((sum, item) => sum + (item.thirdPartyCosts || 0), 0);
    const totalCosts = totalAdSpend + totalNonAdCosts + totalThirdPartyCosts;
    const totalOrders = filteredData.reduce((sum, item) => sum + (item.orders || 0), 0);
    
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const avgSale = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate average adjusted CPA from monthly data
    const validAdjustedCPAData = filteredData.filter(item => item.adjustedCpa > 0);
    const avgAdjustedCPA = validAdjustedCPAData.length > 0 
      ? validAdjustedCPAData.reduce((sum, item) => sum + item.adjustedCpa, 0) / validAdjustedCPAData.length 
      : 0;
    
    // Calculate period-over-period growth
    const calculatePeriodGrowth = () => {
      if (filteredData.length === 0) return { growth: 0, label: 'vs previous period' };
      
      // Calculate the length of the selected period in months
      const startDate = new Date(timeFrame.start + '-01');
      const endDate = new Date(timeFrame.end + '-01');
      const periodLength = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          (endDate.getMonth() - startDate.getMonth()) + 1;
      
      // Try to find equivalent previous period (same length)
      const previousEndDate = new Date(startDate);
      previousEndDate.setMonth(previousEndDate.getMonth() - 1);
      const previousStartDate = new Date(previousEndDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - periodLength + 1);
      
      const previousStart = previousStartDate.toISOString().slice(0, 7);
      const previousEnd = previousEndDate.toISOString().slice(0, 7);
      
      const previousPeriodData = allProductData.filter(item => {
        return isDateInRange(item.month, previousStart, previousEnd, uploadedData);
      });
      
      if (previousPeriodData.length === 0) {
        return { growth: 0, label: 'vs previous period (no data)' };
      }
      
      const previousRevenue = previousPeriodData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      
      if (previousRevenue === 0) {
        return { growth: 0, label: 'vs previous period' };
      }
      
      const growth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
      
      // Determine appropriate label
      const isYearOverYear = previousStartDate.getFullYear() !== startDate.getFullYear();
      const label = isYearOverYear ? 'vs same period last year' : 'vs previous period';
      
      return { growth, label };
    };
    
    const { growth: periodGrowth, label: growthLabel } = calculatePeriodGrowth();

    return {
      totalRevenue,
      totalCosts,
      profit,
      profitMargin,
      totalOrders,
      avgAdjustedCPA,
      avgSale,
      periodGrowth,
      growthLabel,
      isProfitable: profit > 0
    };
  };

  return { calculateMetrics };
};
