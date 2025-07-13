
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
        profitableProducts: 0
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

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      profitMargin,
      totalOrders,
      avgOrderValue,
      totalProducts,
      profitableProducts
    };
  };

  const getTopProducts = (limit: number = 5): TopProduct[] => {
    if (!isDataLoaded) return [];

    const uniqueProducts = getUniqueProducts();
    const filteredData = uploadedData.filter(item => 
      isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData)
    );

    const productMetrics = uniqueProducts.map(product => {
      const productData = filteredData.filter(item => item.id === product.id);
      const revenue = productData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const costs = productData.reduce((sum, item) => 
        sum + (item.adSpend || 0) + (item.nonAdCosts || 0) + (item.thirdPartyCosts || 0), 0
      );
      const orders = productData.reduce((sum, item) => sum + (item.orders || 0), 0);
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        revenue,
        profit,
        profitMargin,
        orders
      };
    });

    return productMetrics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  };

  return {
    calculatePortfolioMetrics,
    getTopProducts
  };
};
