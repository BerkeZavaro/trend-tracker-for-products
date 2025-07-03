
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface MetricsCardsProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

const MetricsCards = ({ productId, timeFrame }: MetricsCardsProps) => {
  const { getProductData, isDataLoaded } = useData();

  const calculateMetrics = () => {
    console.log('=== MetricsCards Debug ===');
    console.log('Product ID:', productId);
    console.log('Time Frame:', timeFrame);
    console.log('Is Data Loaded:', isDataLoaded);

    if (!isDataLoaded || !productId) {
      return {
        totalRevenue: 0,
        totalCosts: 0,
        profit: 0,
        profitMargin: 0,
        totalOrders: 0,
        avgCPA: 0,
        avgSale: 0,
        monthlyGrowth: 0,
        isProfitable: false
      };
    }

    const productData = getProductData(productId);
    console.log('Raw product data length:', productData.length);
    
    // Filter data by time frame
    const filteredData = productData.filter(item => {
      const itemMonth = item.month;
      const inRange = itemMonth >= timeFrame.start && itemMonth <= timeFrame.end;
      console.log(`Month ${itemMonth}: in range ${timeFrame.start} to ${timeFrame.end}? ${inRange}`);
      return inRange;
    });
    
    console.log('Filtered data length:', filteredData.length);
    console.log('Filtered data sample:', filteredData.slice(0, 2));
    
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalAdSpend = filteredData.reduce((sum, item) => sum + (item.adSpend || 0), 0);
    const totalNonAdCosts = filteredData.reduce((sum, item) => sum + (item.nonAdCosts || 0), 0);
    const totalThirdPartyCosts = filteredData.reduce((sum, item) => sum + (item.thirdPartyCosts || 0), 0);
    const totalCosts = totalAdSpend + totalNonAdCosts + totalThirdPartyCosts;
    const totalOrders = filteredData.reduce((sum, item) => sum + (item.orders || 0), 0);
    
    console.log('Calculated values:', {
      totalRevenue,
      totalAdSpend,
      totalOrders,
      totalThirdPartyCosts
    });
    
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const avgCPA = totalOrders > 0 ? totalAdSpend / totalOrders : 0;
    const avgSale = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    console.log('Final CPA calculation:', { totalAdSpend, totalOrders, avgCPA });
    
    // Calculate growth (compare last two months if available)
    const sortedData = filteredData.sort((a, b) => a.month.localeCompare(b.month));
    let monthlyGrowth = 0;
    if (sortedData.length >= 2) {
      const lastMonth = sortedData[sortedData.length - 1].revenue;
      const previousMonth = sortedData[sortedData.length - 2].revenue;
      monthlyGrowth = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
    }

    return {
      totalRevenue,
      totalCosts,
      profit,
      profitMargin,
      totalOrders,
      avgCPA,
      avgSale,
      monthlyGrowth,
      isProfitable: profit > 0
    };
  };

  const metrics = calculateMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Revenue */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${
              metrics.monthlyGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            } hover:bg-current`}>
              {metrics.monthlyGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {metrics.monthlyGrowth >= 0 ? '+' : ''}{metrics.monthlyGrowth.toFixed(1)}%
            </Badge>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Profit/Loss */}
      <Card className={`relative overflow-hidden border-0 shadow-lg ${
        metrics.isProfitable 
          ? 'bg-gradient-to-br from-blue-50 to-cyan-50' 
          : 'bg-gradient-to-br from-red-50 to-orange-50'
      }`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 ${
          metrics.isProfitable 
            ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' 
            : 'bg-gradient-to-br from-red-500/10 to-orange-500/10'
        }`} />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            {metrics.isProfitable ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            Net Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold mb-2 ${
            metrics.isProfitable ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatCurrency(metrics.profit)}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={metrics.isProfitable ? 'default' : 'destructive'} className="text-xs">
              {metrics.profitMargin.toFixed(1)}% margin
            </Badge>
            <span className="text-xs text-gray-500">
              {metrics.isProfitable ? '✅ Profitable' : '⚠️ Loss'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Total Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {metrics.totalOrders.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Avg Sale: {formatCurrency(metrics.avgSale)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* CPA Performance */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Avg CPA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {metrics.avgCPA > 0 ? formatCurrency(metrics.avgCPA) : 'No Data'}
          </div>
          <div className="flex items-center gap-2">
            {metrics.avgCPA > 0 && metrics.avgSale > 0 ? (
              <>
                <Badge variant={metrics.avgCPA < metrics.avgSale ? 'default' : 'destructive'} className="text-xs">
                  {metrics.avgCPA < metrics.avgSale ? '✅ Healthy' : '⚠️ High'}
                </Badge>
                <span className="text-xs text-gray-500">
                  vs {formatCurrency(metrics.avgSale)} avg sale
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-500">
                {metrics.totalOrders === 0 ? 'No orders in period' : 'No ad spend data'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards;
