
import { PerformanceDistribution } from '@/types/portfolioTypes';
import { useProductAnalysis } from './useProductAnalysis';

export const usePortfolioDistribution = (timeFrame: { start: string; end: string }) => {
  const { getProductMetrics } = useProductAnalysis(timeFrame);

  const getPerformanceDistribution = (): PerformanceDistribution => {
    const metrics = getProductMetrics();
    const profitable = metrics.filter(p => p.profit > 0).length;
    // Only count products with revenue activity that are unprofitable
    const unprofitable = metrics.filter(p => p.profit <= 0 && p.revenue > 0).length;
    // Only count products with revenue activity that break even
    const breakeven = metrics.filter(p => p.profit === 0 && p.revenue > 0).length;

    return {
      profitable,
      unprofitable,
      breakeven,
      total: metrics.length
    };
  };

  return {
    getPerformanceDistribution
  };
};
