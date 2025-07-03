
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceTableProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

// Mock detailed monthly data
const generateDetailedData = () => {
  const months = [
    'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
    'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024',
    'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'
  ];

  return months.map((month, index) => {
    const revenue = 8000 + Math.random() * 4000 + (index * 100);
    const adSpend = revenue * (0.3 + Math.random() * 0.2);
    const nonAdCosts = revenue * (0.1 + Math.random() * 0.05);
    const thirdPartyCosts = revenue * (0.05 + Math.random() * 0.03);
    const totalCosts = adSpend + nonAdCosts + thirdPartyCosts;
    const profit = revenue - totalCosts;
    const orders = Math.floor(revenue / (80 + Math.random() * 40));
    const cpa = adSpend / orders;
    const avgSale = revenue / orders;

    return {
      month,
      revenue,
      adSpend,
      nonAdCosts,
      thirdPartyCosts,
      totalCosts,
      profit,
      profitMargin: (profit / revenue) * 100,
      orders,
      cpa,
      avgSale,
      isProfitable: profit > 0,
      performanceRating: profit > revenue * 0.2 ? 'excellent' : profit > 0 ? 'good' : 'poor'
    };
  });
};

const PerformanceTable = ({ productId, timeFrame }: PerformanceTableProps) => {
  const data = generateDetailedData();

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
