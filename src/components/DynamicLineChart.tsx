
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Maximize } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDynamicChartData } from '@/hooks/useDynamicChartData';
import { usePortfolioChartData } from '@/hooks/usePortfolioChartData';
import MetricSelector, { MetricType } from '@/components/chart/MetricSelector';
import DynamicChartTooltip from '@/components/chart/DynamicChartTooltip';
import DynamicChartModal from '@/components/chart/DynamicChartModal';
import { getAxisId, formatDollarAxis, formatNumberAxis, COUNT_METRICS } from '@/utils/chartAxisUtils';

interface DynamicLineChartProps {
  productId?: string;
  timeFrame: { start: string; end: string };
  isPortfolio?: boolean;
  title?: string;
}

const METRIC_COLORS: Record<MetricType, string> = {
  revenue: '#22c55e',
  adSpend: '#3b82f6',
  totalCost: '#f59e0b',
  orders: '#8b5cf6',
  adjustedCpa: '#ef4444',
  avgOrderValue: '#06b6d4',
  profit: '#10b981'
};

const DynamicLineChart = ({ productId, timeFrame, isPortfolio = false, title }: DynamicLineChartProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['revenue']);
  const [showComparison, setShowComparison] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use appropriate hook based on whether it's portfolio or product view
  const productData = useDynamicChartData(productId || '', timeFrame);
  const portfolioData = usePortfolioChartData(timeFrame);
  
  const { data, hasData } = isPortfolio ? portfolioData : productData;

  const handleOpenFullscreen = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Check if we need both axes
  const hasCountMetrics = selectedMetrics.some(metric => COUNT_METRICS.includes(metric));
  const hasMoneyMetrics = selectedMetrics.some(metric => !COUNT_METRICS.includes(metric));

  const chartTitle = title || 'Performance Metrics';

  // Show empty state if no data or no metrics selected
  if (!hasData || selectedMetrics.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
            <span>{chartTitle}</span>
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
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <MetricSelector 
                selectedMetrics={selectedMetrics}
                onMetricsChange={setSelectedMetrics}
              />
              {!isPortfolio && (
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
              )}
            </div>
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

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
            <span>{chartTitle}</span>
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
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <MetricSelector 
                selectedMetrics={selectedMetrics}
                onMetricsChange={setSelectedMetrics}
              />
              {!isPortfolio && (
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
              )}
            </div>
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
                
                <Tooltip content={<DynamicChartTooltip />} />
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
                  />
                ))}

                {/* Previous period lines (if comparison is enabled and not portfolio) */}
                {!isPortfolio && showComparison && selectedMetrics.map((metric) => (
                  <Line
                    key={`${metric}-prev`}
                    type="monotone"
                    dataKey={`previousYear.${metric}`}
                    stroke={METRIC_COLORS[metric]}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    opacity={0.7}
                    yAxisId={getAxisId(metric)}
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
        showComparison={!isPortfolio && showComparison}
        metricColors={METRIC_COLORS}
        title={`${chartTitle} - Fullscreen View`}
      />
    </>
  );
};

export default DynamicLineChart;
