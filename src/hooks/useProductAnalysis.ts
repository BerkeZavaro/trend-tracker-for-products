
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { TopProduct } from '@/types/portfolioTypes';

export const useProductAnalysis = (timeFrame: { start: string; end: string }) => {
  const { uploadedData, getUniqueProducts, isDataLoaded } = useData();

  const getProductMetrics = (): TopProduct[] => {
    if (!isDataLoaded) return [];

    const uniqueProducts = getUniqueProducts();
    const filteredData = uploadedData.filter(item => 
      isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData)
    );

    return uniqueProducts.map(product => {
      const productData = filteredData.filter(item => item.id === product.id);
      const revenue = productData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const costs = productData.reduce((sum, item) => 
        sum + (item.adSpend || 0) + (item.nonAdCosts || 0) + (item.thirdPartyCosts || 0), 0
      );
      const orders = productData.reduce((sum, item) => sum + (item.orders || 0), 0);
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      // Calculate adjusted CPA for this product
      const adjustedCpaSum = productData.reduce((sum, item) => sum + (item.adjustedCpa || 0), 0);
      const adjustedCpaCount = productData.filter(item => (item.adjustedCpa || 0) > 0).length;
      const adjustedCpa = adjustedCpaCount > 0 ? adjustedCpaSum / adjustedCpaCount : 0;

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        revenue,
        profit,
        profitMargin,
        orders,
        adjustedCpa
      };
    });
  };

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

  const getDeclinedProducts = (limit: number = 5): TopProduct[] => {
    if (!isDataLoaded) return [];

    const uniqueProducts = getUniqueProducts();
    const previousPeriod = calculatePreviousPeriod();
    
    // Filter out package products
    const relevantProducts = uniqueProducts.filter(product => 
      !product.category.toLowerCase().includes('package') &&
      !product.category.toLowerCase().includes('bundle') &&
      !product.category.toLowerCase().includes('kit')
    );

    const currentPeriodData = uploadedData.filter(item => 
      isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData)
    );

    const previousPeriodData = uploadedData.filter(item => 
      isDateInRange(item.month, previousPeriod.start, previousPeriod.end, uploadedData)
    );

    const declinedProducts: TopProduct[] = [];

    relevantProducts.forEach(product => {
      // Current period metrics
      const currentData = currentPeriodData.filter(item => item.id === product.id);
      const currentRevenue = currentData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const currentCosts = currentData.reduce((sum, item) => 
        sum + (item.adSpend || 0) + (item.nonAdCosts || 0) + (item.thirdPartyCosts || 0), 0
      );
      const currentProfit = currentRevenue - currentCosts;
      const currentOrders = currentData.reduce((sum, item) => sum + (item.orders || 0), 0);

      // Previous period metrics
      const previousData = previousPeriodData.filter(item => item.id === product.id);
      const previousRevenue = previousData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const previousCosts = previousData.reduce((sum, item) => 
        sum + (item.adSpend || 0) + (item.nonAdCosts || 0) + (item.thirdPartyCosts || 0), 0
      );
      const previousProfit = previousRevenue - previousCosts;

      // Check decline criteria
      if (
        previousProfit > 500 && // Had significant profit before
        currentOrders >= 5 && // Still has reasonable activity
        currentProfit < previousProfit && // Profit declined
        ((previousProfit - currentProfit) / previousProfit) > 0.2 // Declined by more than 20%
      ) {
        const profitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
        const adjustedCpaSum = currentData.reduce((sum, item) => sum + (item.adjustedCpa || 0), 0);
        const adjustedCpaCount = currentData.filter(item => (item.adjustedCpa || 0) > 0).length;
        const adjustedCpa = adjustedCpaCount > 0 ? adjustedCpaSum / adjustedCpaCount : 0;

        declinedProducts.push({
          id: product.id,
          name: product.name,
          category: product.category,
          brand: product.brand,
          revenue: currentRevenue,
          profit: currentProfit,
          profitMargin,
          orders: currentOrders,
          adjustedCpa,
          previousPeriodProfit: previousProfit,
          profitDecline: previousProfit - currentProfit,
          profitDeclinePercentage: ((previousProfit - currentProfit) / previousProfit) * 100
        });
      }
    });

    // Sort by absolute profit decline (biggest decline first)
    return declinedProducts
      .sort((a, b) => (b.profitDecline || 0) - (a.profitDecline || 0))
      .slice(0, limit);
  };

  const getTopProducts = (limit: number = 5): TopProduct[] => {
    return getProductMetrics()
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  };

  const getTopProductsByProfit = (limit: number = 5): TopProduct[] => {
    return getProductMetrics()
      .filter(product => product.revenue > 0) // Only include products with revenue
      .sort((a, b) => b.profit - a.profit) // Sort by absolute profit amount
      .slice(0, limit);
  };

  const getTopProductsByGrowthRate = (limit: number = 5): TopProduct[] => {
    // For growth rate, we'd need to compare periods - simplified for now
    // This would require more complex time period comparison logic
    return getProductMetrics()
      .sort((a, b) => b.revenue - a.revenue) // Placeholder - would need actual growth calculation
      .slice(0, limit);
  };

  const getBottomPerformers = (limit: number = 5): TopProduct[] => {
    return getProductMetrics()
      .filter(product => product.revenue > 0) // Only include products with activity
      .sort((a, b) => a.profitMargin - b.profitMargin) // Lowest profit margin first
      .slice(0, limit);
  };

  return {
    getProductMetrics,
    getDeclinedProducts,
    getTopProducts,
    getTopProductsByProfit,
    getTopProductsByGrowthRate,
    getBottomPerformers
  };
};
