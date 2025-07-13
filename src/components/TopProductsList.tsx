
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics';

interface TopProductsListProps {
  timeFrame: { start: string; end: string };
  onProductSelect: (productId: string) => void;
}

const TopProductsList = ({ timeFrame, onProductSelect }: TopProductsListProps) => {
  const { getTopProducts } = usePortfolioMetrics(timeFrame);
  const topProducts = getTopProducts(5);

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

  if (topProducts.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-8">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top 5 Products by Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
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
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(product.revenue)}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {product.profitMargin >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.profitMargin.toFixed(1)}%
                    </span>
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
      </CardContent>
    </Card>
  );
};

export default TopProductsList;
