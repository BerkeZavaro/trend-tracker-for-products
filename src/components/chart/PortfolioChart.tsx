
import { useState } from 'react';
import { usePortfolioChartData } from '@/hooks/usePortfolioChartData';
import MetricSelector, { MetricType } from './MetricSelector';
import BaseChart from './BaseChart';

interface PortfolioChartProps {
  timeFrame: { start: string; end: string };
  title?: string;
}

const PortfolioChart = ({ timeFrame, title = 'Portfolio Performance Overview' }: PortfolioChartProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['revenue']);

  const { data, hasData } = usePortfolioChartData(timeFrame);

  return (
    <BaseChart
      data={hasData ? data : []}
      selectedMetrics={selectedMetrics}
      showComparison={false}
      title={title}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <MetricSelector 
          selectedMetrics={selectedMetrics}
          onMetricsChange={setSelectedMetrics}
        />
      </div>
    </BaseChart>
  );
};

export default PortfolioChart;
