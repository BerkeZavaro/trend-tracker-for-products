
import { PerformanceGrade, LastMonthMetrics } from '@/types/recommendations';

export const getPerformanceGrade = (metrics: LastMonthMetrics): PerformanceGrade => {
  if (metrics.profitMargin >= 35) {
    return {
      grade: 'Excellent',
      action: 'Consider scaling investment to maximize growth potential',
      impact: 'Accelerate growth while maintaining strong margins',
      color: 'green'
    };
  } else if (metrics.profitMargin >= 25) {
    return {
      grade: 'Good',
      action: 'Focus on efficiency improvements and selective scaling',
      impact: 'Optimize performance and identify growth opportunities',
      color: 'blue'
    };
  } else {
    return {
      grade: 'Poor',
      action: 'Immediate cost optimization and strategy review required',
      impact: 'Restore profitability and business sustainability',
      color: 'red'
    };
  }
};
