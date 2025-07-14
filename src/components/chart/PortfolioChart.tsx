
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { usePortfolioChartData } from '@/hooks/usePortfolioChartData';
import MetricSelector, { MetricType } from './MetricSelector';
import BaseChart from './BaseChart';

interface PortfolioChartProps {
  timeFrame: { start: string; end: string };
  title?: string;
}

const PortfolioChart = ({ timeFrame, title = 'Portfolio Performance Overview' }: PortfolioChartProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['revenue']);
  const [showComparison, setShowComparison] = useState(false);

  const { data, hasData } = usePortfolioChartData(timeFrame);

  return (
    <BaseChart
      data={hasData ? data : []}
      selectedMetrics={selectedMetrics}
      showComparison={showComparison}
      title={title}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <MetricSelector 
          selectedMetrics={selectedMetrics}
          onMetricsChange={setSelectedMetrics}
        />
        <div className="flex items-center space-x-2">
          <Switch
            id="portfolio-comparison-toggle"
            checked={showComparison}
            onCheckedChange={setShowComparison}
          />
          <label htmlFor="portfolio-comparison-toggle" className="text-sm font-medium">
            Compare with previous period
          </label>
        </div>
      </div>
    </BaseChart>
  );
};

export default PortfolioChart;
