
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ProfitCardProps {
  profit: number;
  profitMargin: number;
  isProfitable: boolean;
  formatCurrency: (amount: number) => string;
}

const ProfitCard = ({ profit, profitMargin, isProfitable, formatCurrency }: ProfitCardProps) => {
  return (
    <Card className={`relative overflow-hidden border-0 shadow-lg ${
      isProfitable 
        ? 'bg-gradient-to-br from-blue-50 to-cyan-50' 
        : 'bg-gradient-to-br from-red-50 to-orange-50'
    }`}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 ${
        isProfitable 
          ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' 
          : 'bg-gradient-to-br from-red-500/10 to-orange-500/10'
      }`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {isProfitable ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          Net Profit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold mb-2 ${
          isProfitable ? 'text-green-700' : 'text-red-700'
        }`}>
          {formatCurrency(profit)}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isProfitable ? 'default' : 'destructive'} className="text-xs">
            {profitMargin.toFixed(1)}% margin
          </Badge>
          <span className="text-xs text-gray-500">
            {isProfitable ? '✅ Profitable' : '⚠️ Loss'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitCard;
