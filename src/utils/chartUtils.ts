
import { smartNormalizeDate } from './enhancedDateUtils';
import { ProductData } from '@/contexts/DataContext';

export const normalizeDate = (month: string, allData?: ProductData[]): string => {
  if (allData && allData.length > 0) {
    return smartNormalizeDate(month, allData);
  }
  
  // Fallback to original logic when no data context available
  // Handle YYYY-MM format
  if (month.match(/^\d{4}-\d{2}$/)) {
    return month;
  }
  
  // Handle numeric months (1-12)
  if (month.match(/^\d{1,2}$/)) {
    const monthNum = parseInt(month);
    const currentYear = new Date().getFullYear();
    const year = monthNum <= 6 ? currentYear : currentYear - 1;
    return `${year}-${monthNum.toString().padStart(2, '0')}`;
  }
  
  return month;
};

export const formatValue = (value: number, isRevenue: boolean) => {
  if (isRevenue) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  return `$${value.toFixed(2)}`;
};

export const calculateTrend = (
  data: Array<{ value: number; previousYear?: number | null }>,
  timeFrame?: { start: string; end: string }
): { trend: 'up' | 'down'; trendPercent: number } => {
  if (data.length === 0) return { trend: 'up', trendPercent: 0 };
  
  // If we have timeframe data, calculate period comparison
  if (timeFrame && data.length > 1) {
    // Calculate current period total/average
    const currentPeriodTotal = data.reduce((sum, item) => sum + item.value, 0);
    const currentPeriodAverage = currentPeriodTotal / data.length;
    
    // Calculate previous year period total/average (if available)
    const previousYearData = data.filter(item => item.previousYear !== null && item.previousYear !== undefined);
    if (previousYearData.length > 0) {
      const previousPeriodTotal = previousYearData.reduce((sum, item) => sum + (item.previousYear || 0), 0);
      const previousPeriodAverage = previousPeriodTotal / previousYearData.length;
      
      if (previousPeriodAverage > 0) {
        const trend: 'up' | 'down' = currentPeriodAverage > previousPeriodAverage ? 'up' : 'down';
        const trendPercent = Math.abs(((currentPeriodAverage - previousPeriodAverage) / previousPeriodAverage) * 100);
        return { trend, trendPercent };
      }
    }
    
    // Fallback to first vs last comparison if no previous year data
    const firstValue = data[0]?.value || 0;
    const lastValue = data[data.length - 1]?.value || 0;
    if (firstValue > 0) {
      const trend: 'up' | 'down' = lastValue > firstValue ? 'up' : 'down';
      const trendPercent = Math.abs(((lastValue - firstValue) / firstValue) * 100);
      return { trend, trendPercent };
    }
  }
  
  // Original logic for backward compatibility
  if (data.length < 2) return { trend: 'up', trendPercent: 0 };
  
  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const trend: 'up' | 'down' = currentValue > previousValue ? 'up' : 'down';
  const trendPercent = previousValue > 0 ? Math.abs(((currentValue - previousValue) / previousValue) * 100) : 0;
  
  return { trend, trendPercent };
};
