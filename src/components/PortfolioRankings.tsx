
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

  const topRevenue = getTopProducts(10);
  const topProfit = getTopProductsByProfit(10);
  const declinedProducts = getDeclinedProducts(10);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.map((product, index) => (
          <div 
            key={product.id}
            className="p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
          >
            {/* Header: Ranking and Product Info */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                    #{index + 1}
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate text-sm leading-tight mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {product.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{product.brand}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Info */}
            <div className="mb-2">
              <p className="text-xs text-gray-600">
                {formatNumber(product.orders)} orders
              </p>
            </div>

            {/* Metric and Button */}
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">
                  {showMetric === 'revenue' && formatCurrency(product.revenue)}
                  {showMetric === 'profitMargin' && `${product.profitMargin.toFixed(1)}%`}
                  {showMetric === 'profit' && formatCurrency(product.profit)}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {metricLabel}
                </div>
                {showDecline && product.previousPeriodProfit && (
                  <p className="text-xs text-red-600">
                    Declined by {formatCurrency(product.profitDecline || 0)} 
                    ({(product.profitDeclinePercentage || 0).toFixed(1)}%)
                  </p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onProductSelect(product.id)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs h-7 px-2 ml-2"
              >
                Analyze
                <ChevronRight className="w-3 h-3 ml-1" />
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
                Top 10 Products by Revenue
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
                Top 10 Products by Total Profit
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
