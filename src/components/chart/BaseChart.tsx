
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MetricDataPoint } from '@/hooks/useDynamicChartData';
import { MetricType } from './MetricSelector';
import DynamicChartTooltip from './DynamicChartTooltip';
import DynamicChartModal from './DynamicChartModal';
import { getAxisId, formatDollarAxis, formatNumberAxis, COUNT_METRICS } from '@/utils/chartAxisUtils';
import { ComparisonConfig } from '@/types/comparisonTypes';
import { getComparisonLabel } from '@/utils/comparisonUtils';

export const METRIC_COLORS: Record<MetricType, string> = {
  revenue: '#22c55e',
  adSpend: '#3b82f6',
  totalCost: '#f59e0b',
  orders: '#8b5cf6',
  adjustedCpa: '#ef4444',
  avgOrderValue: '#06b6d4',
  profit: '#10b981'
};

interface BaseChartProps {
  data: MetricDataPoint[];
  selectedMetrics: MetricType[];
  showComparison?: boolean;
  comparisonConfig?: ComparisonConfig;
  title: string;
  children: React.ReactNode;
}

const BaseChart = ({ 
  data, 
  selectedMetrics, 
  showComparison = false, 
  comparisonConfig = { type: 'none' },
  title, 
  children 
}: BaseChartProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenFullscreen = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Check if we need both axes
  const hasCountMetrics = selectedMetrics.some(metric => COUNT_METRICS.includes(metric));
  const hasMoneyMetrics = selectedMetrics.some(metric => !COUNT_METRICS.includes(metric));

  // Show empty state if no data or no metrics selected
  if (data.length === 0 || selectedMetrics.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
            <span>{title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFullscreen}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Fullscreen view"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {children}
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            {selectedMetrics.length === 0 
              ? "Please select at least one metric to display"
              : "No data available for the selected time frame"
            }
          </div>
        </CardContent>
      </Card>
    );
  }

  const comparisonLabel = getComparisonLabel(comparisonConfig);

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
            <span>{title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFullscreen}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Fullscreen view"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {children}
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: hasCountMetrics ? 50 : 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                
                {/* Left Y-axis for money metrics */}
                {hasMoneyMetrics && (
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    tickFormatter={formatDollarAxis}
                  />
                )}
                
                {/* Right Y-axis for count metrics */}
                {hasCountMetrics && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    tickFormatter={formatNumberAxis}
                  />
                )}
                
                <Tooltip content={<DynamicChartTooltip comparisonLabel={comparisonLabel} />} />
                <Legend />

                {/* Current period lines */}
                {selectedMetrics.map((metric) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={METRIC_COLORS[metric]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    yAxisId={getAxisId(metric)}
                    name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                  />
                ))}

                {/* Comparison lines (if comparison is enabled) */}
                {showComparison && selectedMetrics.map((metric) => (
                  <Line
                    key={`${metric}-comparison`}
                    type="monotone"
                    dataKey={`previousYear.${metric}`}
                    stroke={METRIC_COLORS[metric]}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    opacity={0.7}
                    yAxisId={getAxisId(metric)}
                    name={`${metric.charAt(0).toUpperCase() + metric.slice(1)} (${comparisonLabel})`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <DynamicChartModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={data}
        selectedMetrics={selectedMetrics}
        showComparison={showComparison}
        metricColors={METRIC_COLORS}
        title={`${title} - Fullscreen View`}
      />
    </>
  );
};

export default BaseChart;
