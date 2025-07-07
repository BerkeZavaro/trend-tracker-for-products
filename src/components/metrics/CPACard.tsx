
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';

interface CPACardProps {
  avgAdjustedCPA: number;
  avgSale: number;
  totalOrders: number;
  formatCurrency: (amount: number) => string;
}

const CPACard = ({ avgAdjustedCPA, avgSale, totalOrders, formatCurrency }: CPACardProps) => {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full -mr-16 -mt-16" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Avg Adjusted CPA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {avgAdjustedCPA > 0 ? formatCurrency(avgAdjustedCPA) : 'No Data'}
        </div>
        <div className="flex items-center gap-2">
          {avgAdjustedCPA > 0 && avgSale > 0 ? (
            <>
              <Badge variant={avgAdjustedCPA < avgSale ? 'default' : 'destructive'} className="text-xs">
                {avgAdjustedCPA < avgSale ? '✅ Healthy' : '⚠️ High'}
              </Badge>
              <span className="text-xs text-gray-500">
                vs {formatCurrency(avgSale)} avg sale
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-500">
              {totalOrders === 0 ? 'No orders in period' : 'No adjusted CPA data'}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CPACard;
