
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
        avgCPA: 0,
        avgSale: 0,
        monthlyGrowth: 0,
        isProfitable: false
      };
    }

    const productData = getProductData(productId);
    
    // Filter data by time frame using enhanced date comparison
    const filteredData = productData.filter(item => {
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
    const avgCPA = totalOrders > 0 ? totalAdSpend / totalOrders : 0;
    const avgSale = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate growth (compare last two months if available)
    const sortedData = filteredData.sort((a, b) => {
      const aDate = isDateInRange(a.month, '2024-01', '2025-12', uploadedData) ? a.month : '2024-01';
      const bDate = isDateInRange(b.month, '2024-01', '2025-12', uploadedData) ? b.month : '2024-01';
      return aDate.localeCompare(bDate);
    });
    
    let monthlyGrowth = 0;
    if (sortedData.length >= 2) {
      const lastMonth = sortedData[sortedData.length - 1].revenue;
      const previousMonth = sortedData[sortedData.length - 2].revenue;
      monthlyGrowth = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
    }

    return {
      totalRevenue,
      totalCosts,
      profit,
      profitMargin,
      totalOrders,
      avgCPA,
      avgSale,
      monthlyGrowth,
      isProfitable: profit > 0
    };
  };

  return { calculateMetrics };
};
