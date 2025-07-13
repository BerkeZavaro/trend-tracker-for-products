
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useDynamicChartData } from '@/hooks/useDynamicChartData';
import MetricSelector, { MetricType } from './MetricSelector';
import BaseChart from './BaseChart';

interface ProductChartProps {
  productId: string;
  timeFrame: { start: string; end: string };
  title?: string;
}

const ProductChart = ({ productId, timeFrame, title = 'Performance Metrics' }: ProductChartProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['revenue']);
  const [showComparison, setShowComparison] = useState(false);

  const { data, hasData } = useDynamicChartData(productId, timeFrame);

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
            id="comparison-toggle"
            checked={showComparison}
            onCheckedChange={setShowComparison}
          />
          <label htmlFor="comparison-toggle" className="text-sm font-medium">
            Compare with previous period
          </label>
        </div>
      </div>
    </BaseChart>
  );
};

export default ProductChart;
