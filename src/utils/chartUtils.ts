
export const normalizeDate = (month: string): string => {
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

export const calculateTrend = (data: Array<{ value: number }>): { trend: 'up' | 'down'; trendPercent: number } => {
  if (data.length < 2) return { trend: 'up', trendPercent: 0 };
  
  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const trend: 'up' | 'down' = currentValue > previousValue ? 'up' : 'down';
  const trendPercent = previousValue > 0 ? Math.abs(((currentValue - previousValue) / previousValue) * 100) : 0;
  
  return { trend, trendPercent };
};
