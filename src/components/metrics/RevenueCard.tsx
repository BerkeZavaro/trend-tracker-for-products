
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueCardProps {
  totalRevenue: number;
  periodGrowth: number;
  growthLabel: string;
  formatCurrency: (amount: number) => string;
}

const RevenueCard = ({ totalRevenue, periodGrowth, growthLabel, formatCurrency }: RevenueCardProps) => {
  return (
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
          {formatCurrency(totalRevenue)}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${
            periodGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          } hover:bg-current`}>
            {periodGrowth >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {periodGrowth >= 0 ? '+' : ''}{periodGrowth.toFixed(1)}%
          </Badge>
          <span className="text-xs text-gray-500">{growthLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueCard;
