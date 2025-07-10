
import { TrendingUp, TrendingDown, DollarSign, Target, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrendHeaderProps {
  isRevenue: boolean;
  hasData: boolean;
  trend: 'up' | 'down';
  trendPercent: number;
  onOpenFullscreen?: () => void;
}

const TrendHeader = ({ 
  isRevenue, 
  hasData, 
  trend, 
  trendPercent, 
  onOpenFullscreen
}: TrendHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isRevenue ? (
          <DollarSign className="w-5 h-5 text-green-600" />
        ) : (
          <Target className="w-5 h-5 text-blue-600" />
        )}
        {isRevenue ? 'Revenue Trend' : 'CPA Trend'}
      </div>
      <div className="flex items-center gap-2">
        {hasData && (
          <div className="flex items-center gap-2">
            {trend === 'up' ? (
              <TrendingUp className={`w-4 h-4 ${isRevenue ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <TrendingDown className={`w-4 h-4 ${isRevenue ? 'text-red-600' : 'text-green-600'}`} />
            )}
            <span className={`text-sm font-medium ${
              (isRevenue && trend === 'up') || (!isRevenue && trend === 'down') 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {trendPercent.toFixed(1)}%
            </span>
          </div>
        )}
        {onOpenFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenFullscreen}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Fullscreen view"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TrendHeader;
