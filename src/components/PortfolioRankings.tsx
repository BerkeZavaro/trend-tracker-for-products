
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, ChevronRight } from 'lucide-react';
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics';

interface PortfolioRankingsProps {
  timeFrame: { start: string; end: string };
  onProductSelect: (productId: string) => void;
}

const PortfolioRankings = ({ timeFrame, onProductSelect }: PortfolioRankingsProps) => {
  const { 
    getTopProducts, 
    getTopProductsByProfit, 
    getDeclinedProducts 
  } = usePortfolioMetrics(timeFrame);

  const topRevenue = getTopProducts(5);
  const topProfit = getTopProductsByProfit(5);
  const declinedProducts = getDeclinedProducts(5);

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

  const ProductList = ({ products, showMetric, metricLabel, icon, showDecline = false }: {
    products: any[];
    showMetric: 'revenue' | 'profitMargin' | 'profit';
    metricLabel: string;
    icon: React.ReactNode;
    showDecline?: boolean;
  }) => {
    if (products.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No products found matching the criteria</p>
          {showDecline && (
            <p className="text-sm mt-2">This shows products that had significant profit decline compared to the previous period</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {products.map((product, index) => (
          <div 
            key={product.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                  #{index + 1}
                </div>
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {product.brand} • {formatNumber(product.orders)} orders
                </p>
                {showDecline && product.previousPeriodProfit && (
                  <p className="text-xs text-red-600 mt-1">
                    Previous: {formatCurrency(product.previousPeriodProfit)} → 
                    Declined by {formatCurrency(product.profitDecline || 0)} 
                    ({(product.profitDeclinePercentage || 0).toFixed(1)}%)
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {showMetric === 'revenue' && formatCurrency(product.revenue)}
                  {showMetric === 'profitMargin' && `${product.profitMargin.toFixed(1)}%`}
                  {showMetric === 'profit' && formatCurrency(product.profit)}
                </div>
                <div className="text-xs text-gray-500">
                  {metricLabel}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onProductSelect(product.id)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Analyze
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-8">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Product Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Top Revenue
            </TabsTrigger>
            <TabsTrigger value="profit" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Top Profits
            </TabsTrigger>
            <TabsTrigger value="attention" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Need Attention
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Top 5 Products by Revenue
              </h3>
              <p className="text-sm text-gray-600">Highest revenue generators in your portfolio</p>
            </div>
            <ProductList 
              products={topRevenue}
              showMetric="revenue"
              metricLabel="Total Revenue"
              icon={<DollarSign className="w-4 h-4" />}
            />
          </TabsContent>

          <TabsContent value="profit" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Top 5 Products by Total Profit
              </h3>
              <p className="text-sm text-gray-600">Products contributing the most absolute profit to your business</p>
            </div>
            <ProductList 
              products={topProfit}
              showMetric="profit"
              metricLabel="Total Profit"
              icon={<DollarSign className="w-4 h-4" />}
            />
          </TabsContent>

          <TabsContent value="attention" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Products Needing Attention
              </h3>
              <p className="text-sm text-gray-600">
                Products that had strong profits before but declined significantly compared to the previous period. 
                Package deals are excluded to focus on individual product performance.
              </p>
            </div>
            <ProductList 
              products={declinedProducts}
              showMetric="profit"
              metricLabel="Current Profit"
              icon={<AlertTriangle className="w-4 h-4" />}
              showDecline={true}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PortfolioRankings;
