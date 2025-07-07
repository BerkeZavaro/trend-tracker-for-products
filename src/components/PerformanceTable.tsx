
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
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

  // Format change indicator with color and arrow
  const formatChangeIndicator = (absoluteChange: number, percentageChange: number, isPercentage: boolean = false, isCurrency: boolean = true) => {
    if (absoluteChange === 0) return null;

    const isPositive = absoluteChange > 0;
    const arrow = isPositive ? '↑' : '↓';
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    const formattedAbsolute = isPercentage 
      ? `${Math.abs(absoluteChange).toFixed(1)}%`
      : isCurrency 
        ? `$${Math.abs(absoluteChange).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : Math.abs(absoluteChange).toLocaleString();

    const formattedPercentage = `${Math.abs(percentageChange).toFixed(1)}%`;

    return (
      <div className={`text-xs ${colorClass} mt-1`}>
        <div>{arrow} {isPositive ? '+' : '-'}{formattedAbsolute}</div>
        <div className="text-gray-400">({isPositive ? '+' : '-'}{formattedPercentage})</div>
      </div>
    );
  };

  // Format change indicator for CPA/Adjusted CPA/Avg Sale (with decimals)
  const formatChangeIndicatorWithDecimals = (absoluteChange: number, percentageChange: number) => {
    if (absoluteChange === 0) return null;

    const isPositive = absoluteChange > 0;
    const arrow = isPositive ? '↑' : '↓';
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    const formattedAbsolute = `$${Math.abs(absoluteChange).toFixed(2)}`;
    const formattedPercentage = `${Math.abs(percentageChange).toFixed(1)}%`;

    return (
      <div className={`text-xs ${colorClass} mt-1`}>
        <div>{arrow} {isPositive ? '+' : '-'}{formattedAbsolute}</div>
        <div className="text-gray-400">({isPositive ? '+' : '-'}{formattedPercentage})</div>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // New function to format currency with decimals for CPA, Adjusted CPA, and Average Sale
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

                return (
                  <TableRow key={index} className={row.isProfitable ? '' : 'bg-red-50'}>
                    <TableCell className="font-medium text-sm">
                      {row.month}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-700">
                      <div>{formatCurrency(row.revenue)}</div>
                      {revenueChange && formatChangeIndicator(revenueChange.absoluteChange, revenueChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      <div>{formatCurrency(row.adSpend)}</div>
                      {adSpendChange && formatChangeIndicator(adSpendChange.absoluteChange, adSpendChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      <div>{formatCurrency(row.totalCosts)}</div>
                      {totalCostsChange && formatChangeIndicator(totalCostsChange.absoluteChange, totalCostsChange.percentageChange)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${
                      row.profit > 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <div>{formatCurrency(row.profit)}</div>
                      {profitChange && formatChangeIndicator(profitChange.absoluteChange, profitChange.percentageChange)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      row.profitMargin > 20 ? 'text-green-700' : 
                      row.profitMargin > 0 ? 'text-blue-700' : 'text-red-700'
                    }`}>
                      <div>{row.profitMargin.toFixed(1)}%</div>
                      {marginChange && formatChangeIndicator(marginChange.absoluteChange, marginChange.percentageChange, true, false)}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      <div>{row.orders.toLocaleString()}</div>
                      {ordersChange && formatChangeIndicator(ordersChange.absoluteChange, ordersChange.percentageChange, false, false)}
                    </TableCell>
                    <TableCell className={`text-right ${
                      row.cpa < row.avgSale * 0.8 ? 'text-green-700' : 'text-orange-600'
                    }`}>
                      <div>{formatCurrencyWithDecimals(row.cpa)}</div>
                      {cpaChange && formatChangeIndicatorWithDecimals(cpaChange.absoluteChange, cpaChange.percentageChange)}
                    </TableCell>
                    <TableCell className={`text-right ${
                      row.adjustedCpa < row.avgSale * 0.8 ? 'text-green-700' : 'text-orange-600'
                    }`}>
                      <div>{formatCurrencyWithDecimals(row.adjustedCpa)}</div>
                      {adjustedCpaChange && formatChangeIndicatorWithDecimals(adjustedCpaChange.absoluteChange, adjustedCpaChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      <div>{formatCurrencyWithDecimals(row.avgSale)}</div>
                      {avgSaleChange && formatChangeIndicatorWithDecimals(avgSaleChange.absoluteChange, avgSaleChange.percentageChange)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPerformanceBadge(row.performanceRating, row.isProfitable)}
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
