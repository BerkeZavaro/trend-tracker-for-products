
import { useState } from 'react';
import { useDynamicChartData } from '@/hooks/useDynamicChartData';
import MetricSelector, { MetricType } from './MetricSelector';
import BaseChart from './BaseChart';
import ComparisonSelector from './ComparisonSelector';
import { ComparisonConfig } from '@/types/comparisonTypes';

interface ProductChartProps {
  productId: string;
  timeFrame: { start: string; end: string };
  comparisonConfig?: ComparisonConfig;
  title?: string;
}

const ProductChart = ({ 
  productId, 
  timeFrame, 
  comparisonConfig = { type: 'none' },
  title = 'Performance Metrics' 
}: ProductChartProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['revenue']);
  const [localComparisonConfig, setLocalComparisonConfig] = useState<ComparisonConfig>(comparisonConfig);

  const { data, hasData } = useDynamicChartData(productId, timeFrame, localComparisonConfig);

  const showComparison = localComparisonConfig.type !== 'none';

  return (
    <BaseChart
      data={hasData ? data : []}
      selectedMetrics={selectedMetrics}
      showComparison={showComparison}
      comparisonConfig={localComparisonConfig}
      title={title}
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <MetricSelector 
          selectedMetrics={selectedMetrics}
          onMetricsChange={setSelectedMetrics}
        />
        <ComparisonSelector
          comparisonConfig={localComparisonConfig}
          onComparisonChange={setLocalComparisonConfig}
        />
      </div>
    </BaseChart>
  );
};

export default ProductChart;
