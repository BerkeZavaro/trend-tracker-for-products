
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics';

interface PerformanceDistributionCardProps {
  timeFrame: { start: string; end: string };
}

const PerformanceDistributionCard = ({ timeFrame }: PerformanceDistributionCardProps) => {
  const { getPerformanceDistribution } = usePortfolioMetrics(timeFrame);
  const distribution = getPerformanceDistribution();

  if (distribution.total === 0) {
    return null;
  }

  const profitablePercentage = (distribution.profitable / distribution.total) * 100;
  const unprofitablePercentage = (distribution.unprofitable / distribution.total) * 100;

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Profitable Products */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Profitable Products</span>
              </div>
              <div className="text-sm font-semibold text-green-600">
                {distribution.profitable} ({profitablePercentage.toFixed(1)}%)
              </div>
            </div>
            <Progress value={profitablePercentage} className="h-2" />
          </div>

          {/* Unprofitable Products */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Unprofitable Products</span>
              </div>
              <div className="text-sm font-semibold text-red-600">
                {distribution.unprofitable} ({unprofitablePercentage.toFixed(1)}%)
              </div>
            </div>
            <Progress value={unprofitablePercentage} className="h-2" />
          </div>

          {/* Summary Stats */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{distribution.profitable}</div>
                <div className="text-xs text-gray-500">Making Profit</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{distribution.unprofitable}</div>
                <div className="text-xs text-gray-500">Need Attention</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceDistributionCard;
