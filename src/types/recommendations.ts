
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
}

export interface LastMonthMetrics {
  revenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  cpa: number;
  avgSale: number;
  orders: number;
}

export interface MonthOverMonthChange {
  revenue: number;
  profit: number;
  cpa: number;
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

export interface PerformanceGrade {
  grade: string;
  action: string;
  impact: string;
  color: string;
}
