
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';

export interface PortfolioMetrics {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  profitMargin: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProducts: number;
  profitableProducts: number;
  portfolioAdjustedCPA: number;
  revenueConcentration: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  revenue: number;
  profit: number;
  profitMargin: number;
  orders: number;
  adjustedCpa: number;
  growthRate?: number;
}

export const usePortfolioMetrics = (timeFrame: { start: string; end: string }) => {
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

    // Calculate revenue concentration (% from top 5 products)
    const topProducts = getTopProducts(5);
    const top5Revenue = topProducts.reduce((sum, product) => sum + product.revenue, 0);
    const revenueConcentration = totalRevenue > 0 ? (top5Revenue / totalRevenue) * 100 : 0;

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

  const getTopProducts = (limit: number = 5): TopProduct[] => {
    return getProductMetrics()
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  };

  const getTopProductsByProfitMargin = (limit: number = 5): TopProduct[] => {
    return getProductMetrics()
      .filter(product => product.revenue > 0) // Only include products with revenue
      .sort((a, b) => b.profitMargin - a.profitMargin)
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

  const getPerformanceDistribution = () => {
    const metrics = getProductMetrics();
    const profitable = metrics.filter(p => p.profit > 0).length;
    const unprofitable = metrics.filter(p => p.profit <= 0).length;
    const breakeven = metrics.filter(p => p.profit === 0).length;

    return {
      profitable,
      unprofitable,
      breakeven,
      total: metrics.length
    };
  };

  return {
    calculatePortfolioMetrics,
    getTopProducts,
    getTopProductsByProfitMargin,
    getTopProductsByGrowthRate,
    getBottomPerformers,
    getPerformanceDistribution
  };
};
