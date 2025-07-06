
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
        avgSale: item.averageSale,
        isProfitable: profit > 0,
        performanceRating: profit > item.revenue * 0.2 ? 'excellent' : profit > 0 ? 'good' : 'poor'
      };
    });
  };

  const data = getRealData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
                <TableHead className="text-right">Avg Sale</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className={row.isProfitable ? '' : 'bg-red-50'}>
                  <TableCell className="font-medium text-sm">
                    {row.month}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-700">
                    {formatCurrency(row.revenue)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(row.adSpend)}
                  </TableCell>
                  <TableCell className="text-right text-gray-700">
                    {formatCurrency(row.totalCosts)}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${
                    row.profit > 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatCurrency(row.profit)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    row.profitMargin > 20 ? 'text-green-700' : 
                    row.profitMargin > 0 ? 'text-blue-700' : 'text-red-700'
                  }`}>
                    {row.profitMargin.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-gray-700">
                    {row.orders.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right ${
                    row.cpa < row.avgSale * 0.8 ? 'text-green-700' : 'text-orange-600'
                  }`}>
                    {formatCurrency(row.cpa)}
                  </TableCell>
                  <TableCell className="text-right text-gray-700">
                    {formatCurrency(row.avgSale)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPerformanceBadge(row.performanceRating, row.isProfitable)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTable;
