
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatCurrencyWithDecimals = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const processPerformanceData = (productData: any[]) => {
  return productData.map(item => {
    const totalCosts = item.adSpend + item.nonAdCosts + item.thirdPartyCosts;
    const profit = item.revenue - totalCosts;
    const profitMargin = item.revenue > 0 ? (profit / item.revenue) * 100 : 0;

    return {
      month: item.month,
      revenue: item.revenue,
      adSpend: item.adSpend,
      nonAdCosts: item.nonAdCosts,
      thirdPartyCosts: item.thirdPartyCosts,
      totalCosts,
      profit,
      profitMargin,
      orders: item.orders,
      cpa: item.cpa,
      adjustedCpa: item.adjustedCpa,
      avgSale: item.averageSale,
      isProfitable: profit > 0,
      performanceRating: profit > item.revenue * 0.2 ? 'excellent' : profit > 0 ? 'good' : 'poor'
    };
  });
};

export const getRowBackgroundClass = (rating: string, isProfitable: boolean) => {
  if (rating === 'excellent') {
    return 'bg-green-50/40 hover:bg-green-50/60';
  } else if (rating === 'good' && isProfitable) {
    return 'bg-blue-50/40 hover:bg-blue-50/60';
  } else if (!isProfitable) {
    return 'bg-red-50/40 hover:bg-red-50/60';
  }
  return 'hover:bg-gray-50/60';
};
