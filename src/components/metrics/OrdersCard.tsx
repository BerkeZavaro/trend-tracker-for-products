
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { formatCurrencyWithDecimals } from '@/utils/performanceMetrics';

interface OrdersCardProps {
  totalOrders: number;
  avgSale: number;
  formatCurrency: (amount: number) => string;
}

const OrdersCard = ({ totalOrders, avgSale, formatCurrency }: OrdersCardProps) => {
  return (
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
          {totalOrders.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Avg Sale: {formatCurrencyWithDecimals(avgSale)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersCard;
