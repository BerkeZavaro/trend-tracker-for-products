
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { PortfolioMetrics } from '@/types/portfolioTypes';

export const usePortfolioCalculations = (timeFrame: { start: string; end: string }) => {
  const { uploadedData, getUniqueProducts, isDataLoaded } = useData();

  const calculatePortfolioMetrics = (): PortfolioMetrics => {
    if (!isDataLoaded) {
      return {
        totalRevenue: 0,
        totalCosts: 0,
        totalProfit: 0,
        profitMargin: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalProducts: 0,
        profitableProducts: 0,
        portfolioAdjustedCPA: 0,
        revenueConcentration: 0
      };
    }

    // Filter data by time frame
    const filteredData = uploadedData.filter(item => 
      isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData)
    );

    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalAdSpend = filteredData.reduce((sum, item) => sum + (item.adSpend || 0), 0);
    const totalNonAdCosts = filteredData.reduce((sum, item) => sum + (item.nonAdCosts || 0), 0);
    const totalThirdPartyCosts = filteredData.reduce((sum, item) => sum + (item.thirdPartyCosts || 0), 0);
    const totalCosts = totalAdSpend + totalNonAdCosts + totalThirdPartyCosts;
    const totalOrders = filteredData.reduce((sum, item) => sum + (item.orders || 0), 0);
    
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const uniqueProducts = getUniqueProducts();
    const totalProducts = uniqueProducts.length;
    
    // Count profitable products
    const profitableProducts = uniqueProducts.filter(product => {
      const productData = filteredData.filter(item => item.id === product.id);
      const productRevenue = productData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const productCosts = productData.reduce((sum, item) => 
        sum + (item.adSpend || 0) + (item.nonAdCosts || 0) + (item.thirdPartyCosts || 0), 0
      );
      return productRevenue > productCosts;
    }).length;

    // Calculate portfolio-level adjusted CPA
    const totalAdjustedCpaSum = filteredData.reduce((sum, item) => sum + (item.adjustedCpa || 0), 0);
    const totalAdjustedCpaCount = filteredData.filter(item => (item.adjustedCpa || 0) > 0).length;
    const portfolioAdjustedCPA = totalAdjustedCpaCount > 0 ? totalAdjustedCpaSum / totalAdjustedCpaCount : 0;

    // Calculate revenue concentration - we'll get this from product analysis
    const revenueConcentration = 0; // Will be calculated by the main hook

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      profitMargin,
      totalOrders,
      avgOrderValue,
      totalProducts,
      profitableProducts,
      portfolioAdjustedCPA,
      revenueConcentration
    };
  };

  return {
    calculatePortfolioMetrics
  };
};
