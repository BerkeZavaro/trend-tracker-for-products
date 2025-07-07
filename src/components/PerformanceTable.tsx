import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/enhancedDateUtils';

interface PerformanceTableProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

const PerformanceTable = ({ productId, timeFrame }: PerformanceTableProps) => {
  const { getProductData, isDataLoaded, uploadedData } = useData();

  const getRealData = () => {
    if (!isDataLoaded || !productId) {
      return [];
    }

    const productData = getProductData(productId);
    
    // Filter data by time frame using enhanced date comparison
    const filteredData = productData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });

    // Process the real data to calculate derived metrics
    return filteredData.map(item => {
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

  const data = getRealData();

  // Calculate month-over-month changes
  const calculateChange = (current: number, previous: number) => {
    const absoluteChange = current - previous;
    const percentageChange = previous !== 0 ? (absoluteChange / previous) * 100 : 0;
    return { absoluteChange, percentageChange };
  };

  // Simplified format change indicator - only percentage with arrow
  const formatChangeIndicator = (percentageChange: number) => {
    if (Math.abs(percentageChange) < 0.1) return null;

    const isPositive = percentageChange > 0;
    const arrow = isPositive ? '↑' : '↓';
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    const formattedPercentage = `${Math.abs(percentageChange).toFixed(1)}%`;

    return (
      <div className={`text-xs ${colorClass} mt-0.5`}>
        {arrow} {isPositive ? '+' : '-'}{formattedPercentage}
      </div>
    );
  };

  // Calculate overall trend for the month
  const calculateOverallTrend = (row: any, previousRow: any) => {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <ArrowRight className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyWithDecimals = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getPerformanceBadge = (rating: string, isProfitable: boolean) => {
    if (rating === 'excellent') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Excellent
      </Badge>;
    } else if (rating === 'good' && isProfitable) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <TrendingUp className="w-3 h-3 mr-1" />
        Good
      </Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Poor
      </Badge>;
    }
  };

  const getRowBackgroundClass = (rating: string, isProfitable: boolean) => {
    if (rating === 'excellent') {
      return 'bg-green-50/40 hover:bg-green-50/60';
    } else if (rating === 'good' && isProfitable) {
      return 'bg-blue-50/40 hover:bg-blue-50/60';
    } else if (!isProfitable) {
      return 'bg-red-50/40 hover:bg-red-50/60';
    }
    return 'hover:bg-gray-50/60';
  };

  if (!isDataLoaded) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Monthly Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Please upload Excel data to view performance metrics.</p>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Monthly Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data available for the selected product and time period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-8">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Monthly Performance Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Month</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Ad Spend</TableHead>
                <TableHead className="text-right">Total Costs</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">CPA</TableHead>
                <TableHead className="text-right">Adjusted CPA</TableHead>
                <TableHead className="text-right">Avg Sale</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const previousRow = index > 0 ? data[index - 1] : null;
                
                // Calculate changes for each metric
                const revenueChange = previousRow ? calculateChange(row.revenue, previousRow.revenue) : null;
                const adSpendChange = previousRow ? calculateChange(row.adSpend, previousRow.adSpend) : null;
                const totalCostsChange = previousRow ? calculateChange(row.totalCosts, previousRow.totalCosts) : null;
                const profitChange = previousRow ? calculateChange(row.profit, previousRow.profit) : null;
                const marginChange = previousRow ? calculateChange(row.profitMargin, previousRow.profitMargin) : null;
                const ordersChange = previousRow ? calculateChange(row.orders, previousRow.orders) : null;
                const cpaChange = previousRow ? calculateChange(row.cpa, previousRow.cpa) : null;
                const adjustedCpaChange = previousRow ? calculateChange(row.adjustedCpa, previousRow.adjustedCpa) : null;
                const avgSaleChange = previousRow ? calculateChange(row.avgSale, previousRow.avgSale) : null;

                const overallTrend = previousRow ? calculateOverallTrend(row, previousRow) : 'stable';
                const rowBgClass = getRowBackgroundClass(row.performanceRating, row.isProfitable);

                return (
                  <TableRow key={index} className={rowBgClass}>
                    <TableCell className="font-medium text-sm text-slate-800">
                      {row.month}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-800">
                      <div>{formatCurrency(row.revenue)}</div>
                      {revenueChange && formatChangeIndicator(revenueChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      <div>{formatCurrency(row.adSpend)}</div>
                      {adSpendChange && formatChangeIndicator(adSpendChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      <div>{formatCurrency(row.totalCosts)}</div>
                      {totalCostsChange && formatChangeIndicator(totalCostsChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-800">
                      <div>{formatCurrency(row.profit)}</div>
                      {profitChange && formatChangeIndicator(profitChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700">
                      <div>{row.profitMargin.toFixed(1)}%</div>
                      {marginChange && formatChangeIndicator(marginChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      <div>{row.orders.toLocaleString()}</div>
                      {ordersChange && formatChangeIndicator(ordersChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      <div>{formatCurrencyWithDecimals(row.cpa)}</div>
                      {cpaChange && formatChangeIndicator(cpaChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      <div>{formatCurrencyWithDecimals(row.adjustedCpa)}</div>
                      {adjustedCpaChange && formatChangeIndicator(adjustedCpaChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      <div>{formatCurrencyWithDecimals(row.avgSale)}</div>
                      {avgSaleChange && formatChangeIndicator(avgSaleChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPerformanceBadge(row.performanceRating, row.isProfitable)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(overallTrend)}
                        <span className={`text-xs font-medium ${
                          overallTrend === 'improving' ? 'text-green-600' :
                          overallTrend === 'declining' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {getTrendLabel(overallTrend)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTable;
