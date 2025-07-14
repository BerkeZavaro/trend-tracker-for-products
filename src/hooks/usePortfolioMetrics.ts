
import { usePortfolioCalculations } from './usePortfolioCalculations';
import { useProductAnalysis } from './useProductAnalysis';
import { usePortfolioDistribution } from './usePortfolioDistribution';
import { PortfolioMetrics } from '@/types/portfolioTypes';

export type { PortfolioMetrics, TopProduct } from '@/types/portfolioTypes';

export const usePortfolioMetrics = (timeFrame: { start: string; end: string }) => {
  const { calculatePortfolioMetrics: calculateBaseMetrics } = usePortfolioCalculations(timeFrame);
  const { 
    getTopProducts, 
    getTopProductsByProfit, 
    getTopProductsByGrowthRate, 
    getBottomPerformers, 
    getDeclinedProducts 
  } = useProductAnalysis(timeFrame);
  const { getPerformanceDistribution } = usePortfolioDistribution(timeFrame);

  const calculatePortfolioMetrics = (): PortfolioMetrics => {
    const baseMetrics = calculateBaseMetrics();
    
    // Calculate revenue concentration (% from top 5 products)
    const topProducts = getTopProducts(5);
    const top5Revenue = topProducts.reduce((sum, product) => sum + product.revenue, 0);
    const revenueConcentration = baseMetrics.totalRevenue > 0 ? (top5Revenue / baseMetrics.totalRevenue) * 100 : 0;

    return {
      ...baseMetrics,
      revenueConcentration
    };
  };

  return {
    calculatePortfolioMetrics,
    getTopProducts,
    getTopProductsByProfit,
    getTopProductsByGrowthRate,
    getBottomPerformers,
    getPerformanceDistribution,
    getDeclinedProducts
  };
};
