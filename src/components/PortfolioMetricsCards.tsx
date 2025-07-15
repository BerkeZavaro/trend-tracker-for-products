
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Target, Package, PieChart, MousePointer } from 'lucide-react';
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics';
import { formatCurrencyWithDecimals } from '@/utils/performanceMetrics';

interface PortfolioMetricsCardsProps {
  timeFrame: { start: string; end: string };
}

const PortfolioMetricsCards = ({ timeFrame }: PortfolioMetricsCardsProps) => {
  const { calculatePortfolioMetrics } = usePortfolioMetrics(timeFrame);
  const metrics = calculatePortfolioMetrics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {/* Total Revenue */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Across {metrics.totalProducts} products
          </p>
        </CardContent>
      </Card>

      {/* Total Profit */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Profit</CardTitle>
          {metrics.totalProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(metrics.totalProfit)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={metrics.profitMargin >= 0 ? "default" : "destructive"}
              className="text-xs"
            >
              {metrics.profitMargin.toFixed(1)}% margin
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(metrics.totalOrders)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Avg: {formatCurrencyWithDecimals(metrics.avgOrderValue)} per order
          </p>
        </CardContent>
      </Card>

      {/* Portfolio CPA */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Portfolio CPA</CardTitle>
          <MousePointer className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(metrics.portfolioAdjustedCPA)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Avg cost per acquisition
          </p>
        </CardContent>
      </Card>

      {/* Product Performance */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Product Performance</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.profitableProducts}/{metrics.totalProducts}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Products profitable
          </p>
        </CardContent>
      </Card>

      {/* Revenue Concentration */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Revenue Focus</CardTitle>
          <PieChart className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.revenueConcentration.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-500 mt-1">
            From top 5 products
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioMetricsCards;
