
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TrendHeader from './TrendHeader';

interface TrendChartEmptyProps {
  metric: 'revenue' | 'cpa';
  trend: 'up' | 'down';
  trendPercent: number;
  onOpenFullscreen: () => void;
}

const TrendChartEmpty = ({ 
  metric, 
  trend, 
  trendPercent, 
  onOpenFullscreen 
}: TrendChartEmptyProps) => {
  const isRevenue = metric === 'revenue';

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-800">
          <TrendHeader 
            isRevenue={isRevenue}
            hasData={false}
            trend={trend}
            trendPercent={trendPercent}
            onOpenFullscreen={onOpenFullscreen}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-gray-500 transition-all duration-300">
          No data available for the selected time frame
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChartEmpty;
