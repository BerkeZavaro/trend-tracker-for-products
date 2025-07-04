
export const normalizeDate = (month: string): string => {
  if (month.match(/^\d{4}-\d{2}$/)) {
    return month; // Already in YYYY-MM format
  }
  
  if (month.match(/^\d{1,2}$/)) {
    const monthNum = parseInt(month);
    // Simple heuristic: assume months 1-6 are recent (2025), 7-12 are previous year (2024)
    const year = monthNum <= 6 ? 2025 : 2024;
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

export const calculateTrend = (data: Array<{ value: number }>) => {
  if (data.length < 2) return { trend: 'up' as const, trendPercent: 0 };
  
  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const trend = currentValue > previousValue ? 'up' : 'down';
  const trendPercent = previousValue > 0 ? Math.abs(((currentValue - previousValue) / previousValue) * 100) : 0;
  
  return { trend, trendPercent };
};
