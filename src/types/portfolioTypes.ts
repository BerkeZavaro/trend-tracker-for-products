
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
  previousPeriodProfit?: number;
  profitDecline?: number;
  profitDeclinePercentage?: number;
}

export interface PerformanceDistribution {
  profitable: number;
  unprofitable: number;
  breakeven: number;
  total: number;
}
