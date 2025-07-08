
import { LucideIcon } from 'lucide-react';
import { ProductData } from '@/contexts/DataContext';

export interface EnhancedRecommendation {
  type: 'strategic' | 'tactical' | 'warning' | 'opportunity';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dataInsight: string;
  action: string;
  expectedImpact: string;
  timeframe: 'immediate' | 'next-month' | 'next-quarter';
  icon: LucideIcon;
  color: string;
  source: 'last-month' | 'timeframe' | 'validation'; // New field to identify recommendation source
}

export interface LastMonthMetrics {
  revenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  adjustedCpa: number;
  avgSale: number;
  orders: number;
}

export interface TimeframeMetrics {
  avgRevenue: number;
  totalRevenue: number;
  avgProfit: number;
  avgProfitMargin: number;
  avgAdjustedCpa: number;
  totalOrders: number;
  monthCount: number;
  revenueGrowthRate: number;
  bestMonth: ProductData;
  worstMonth: ProductData;
  consistencyScore: number;
}

export interface MonthOverMonthChange {
  revenue: number;
  profit: number;
  adjustedCpa: number;
  orders: number;
}

export interface LastMonthAnalysis {
  lastMonth: ProductData | null;
  lastMonthMetrics: LastMonthMetrics;
  previousMonth: ProductData | null;
  monthOverMonthChange: MonthOverMonthChange;
  isOutlier: boolean;
  outlierReason: string;
}

export interface TimeframeAnalysis {
  timeframeMetrics: TimeframeMetrics;
  trendDirection: 'improving' | 'declining' | 'stable';
  seasonalPatterns: string[];
  performanceConsistency: 'high' | 'medium' | 'low';
}

export interface PerformanceGrade {
  grade: string;
  action: string;
  impact: string;
  color: string;
}
