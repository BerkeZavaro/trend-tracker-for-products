
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface MetricsCardsProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

// Mock data calculation - replace with real data fetching
const calculateMetrics = (productId: string, timeFrame: { start: string; end: string }) => {
  // Simulate API call and calculations
  return {
    totalRevenue: 125840,
    totalCosts: 89650,
    profit: 36190,
    profitMargin: 28.8,
    totalOrders: 1247,
    avgCPA: 71.9,
    avgSale: 100.95,
    trendDirection: 'up',
    monthlyGrowth: 12.5,
    bestMonth: 'March 2024',
    worstMonth: 'January 2024',
    isProfitable: true,
    riskLevel: 'low'
  };
};

const MetricsCards = ({ productId, timeFrame }: MetricsCardsProps) => {
  const metrics = calculateMetrics(productId, timeFrame);

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
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{metrics.monthlyGrowth}%
            </Badge>
            <span className="text-xs text-gray-500">vs last period</span>
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
              {metrics.profitMargin}% margin
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
            {formatCurrency(metrics.avgCPA)}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={metrics.avgCPA < metrics.avgSale ? 'default' : 'destructive'} className="text-xs">
              {metrics.avgCPA < metrics.avgSale ? '✅ Healthy' : '⚠️ High'}
            </Badge>
            <span className="text-xs text-gray-500">
              vs {formatCurrency(metrics.avgSale)} avg sale
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards;
