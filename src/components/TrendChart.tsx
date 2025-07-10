
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrendChartData } from '@/hooks/useTrendChartData';
import TrendHeader from '@/components/chart/TrendHeader';
import TrendChartArea from '@/components/chart/TrendChartArea';
import TrendChartEmpty from '@/components/chart/TrendChartEmpty';
import ChartModal from '@/components/chart/ChartModal';

interface TrendChartProps {
  productId: string;
  timeFrame: { start: string; end: string };
  metric: 'revenue' | 'cpa';
}

const TrendChart = ({ productId, timeFrame, metric }: TrendChartProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, trend, trendPercent, hasData } = useTrendChartData(productId, timeFrame, metric);
  const isRevenue = metric === 'revenue';

  const handleOpenFullscreen = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Show empty state if no data
  if (!hasData) {
    return (
      <TrendChartEmpty
        metric={metric}
        trend={trend}
        trendPercent={trendPercent}
        onOpenFullscreen={handleOpenFullscreen}
      />
    );
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-800">
            <TrendHeader 
              isRevenue={isRevenue}
              hasData={hasData}
              trend={trend}
              trendPercent={trendPercent}
              onOpenFullscreen={handleOpenFullscreen}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChartArea
            data={data}
            metric={metric}
          />
        </CardContent>
      </Card>

      <ChartModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={data}
        metric={metric}
        title={`${isRevenue ? 'Revenue' : 'CPA'} Trend - Fullscreen View`}
        trend={trend}
        trendPercent={trendPercent}
      />
    </>
  );
};

export default TrendChart;
