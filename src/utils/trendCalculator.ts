
export const calculateChange = (current: number, previous: number) => {
  const absoluteChange = current - previous;
  const percentageChange = previous !== 0 ? (absoluteChange / previous) * 100 : 0;
  return { absoluteChange, percentageChange };
};

export const calculateOverallTrend = (row: any, previousRow: any): 'improving' | 'declining' | 'stable' => {
  if (!previousRow) return 'stable';

  let positiveChanges = 0;
  let negativeChanges = 0;
  let totalChanges = 0;

  // Check key metrics for trend
  const metrics = [
    { current: row.revenue, previous: previousRow.revenue, weight: 3 }, // Revenue is most important
    { current: row.profit, previous: previousRow.profit, weight: 3 }, // Profit is most important
    { current: row.profitMargin, previous: previousRow.profitMargin, weight: 2 },
    { current: row.orders, previous: previousRow.orders, weight: 2 },
    { current: row.cpa, previous: previousRow.cpa, weight: 1, inverse: true }, // Lower CPA is better
    { current: row.adjustedCpa, previous: previousRow.adjustedCpa, weight: 1, inverse: true }
  ];

  metrics.forEach(metric => {
    if (metric.previous !== 0) {
      const change = (metric.current - metric.previous) / metric.previous;
      const isPositive = metric.inverse ? change < 0 : change > 0;
      
      if (Math.abs(change) > 0.02) { // 2% threshold
        if (isPositive) {
          positiveChanges += metric.weight;
        } else {
          negativeChanges += metric.weight;
        }
        totalChanges += metric.weight;
      }
    }
  });

  if (totalChanges === 0) return 'stable';
  
  const positiveRatio = positiveChanges / totalChanges;
  if (positiveRatio > 0.6) return 'improving';
  if (positiveRatio < 0.4) return 'declining';
  return 'stable';
};

// Helper function to get previous year month
export const getPreviousYearMonth = (currentMonth: string): string => {
  // Handle YYYY-MM format
  if (currentMonth.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = currentMonth.split('-');
    const previousYear = (parseInt(year) - 1).toString();
    return `${previousYear}-${month}`;
  }
  return '';
};

// Calculate Year-over-Year change
export const calculateYoYChange = (currentRow: any, allProductData: any[]) => {
  const currentMonth = currentRow.month;
  const previousYearMonth = getPreviousYearMonth(currentMonth);
  
  if (!previousYearMonth) return null;
  
  // Find the same month from previous year
  const previousYearRow = allProductData.find(row => row.month === previousYearMonth);
  
  if (!previousYearRow) return null;
  
  return {
    revenue: calculateChange(currentRow.revenue, previousYearRow.revenue),
    profit: calculateChange(currentRow.profit, previousYearRow.profit),
    profitMargin: calculateChange(currentRow.profitMargin, previousYearRow.profitMargin),
    orders: calculateChange(currentRow.orders, previousYearRow.orders),
    cpa: calculateChange(currentRow.cpa, previousYearRow.cpa),
    adjustedCpa: calculateChange(currentRow.adjustedCpa, previousYearRow.adjustedCpa),
    avgSale: calculateChange(currentRow.avgSale, previousYearRow.avgSale),
    comparedToMonth: previousYearMonth
  };
};
