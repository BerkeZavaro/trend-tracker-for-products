
import { MetricType } from '@/components/chart/MetricSelector';

// Define which metrics use which axis
export const MONEY_METRICS: MetricType[] = ['revenue', 'adSpend', 'totalCost', 'adjustedCpa', 'avgOrderValue', 'profit'];
export const COUNT_METRICS: MetricType[] = ['orders'];

export const getAxisId = (metric: MetricType): 'left' | 'right' => {
  return COUNT_METRICS.includes(metric) ? 'right' : 'left';
};

export const formatDollarAxis = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export const formatNumberAxis = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};
