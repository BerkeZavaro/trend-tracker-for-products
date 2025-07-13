
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MetricDataPoint } from '@/hooks/useDynamicChartData';
import { MetricType } from './MetricSelector';
import DynamicChartTooltip from './DynamicChartTooltip';
import { getAxisId, formatDollarAxis, formatNumberAxis, COUNT_METRICS } from '@/utils/chartAxisUtils';

interface DynamicChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MetricDataPoint[];
  selectedMetrics: MetricType[];
  showComparison: boolean;
  metricColors: Record<MetricType, string>;
  title: string;
}

const DynamicChartModal = ({ 
  isOpen, 
  onClose, 
  data, 
  selectedMetrics, 
  showComparison, 
  metricColors, 
  title 
}: DynamicChartModalProps) => {
  // Check if we need both axes
  const hasCountMetrics = selectedMetrics.some(metric => COUNT_METRICS.includes(metric));
  const hasMoneyMetrics = selectedMetrics.some(metric => !COUNT_METRICS.includes(metric));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <div className="h-[calc(100vh-200px)] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: hasCountMetrics ? 70 : 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 14 }}
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                
                {/* Left Y-axis for money metrics */}
                {hasMoneyMetrics && (
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 14 }}
                    stroke="#6b7280"
                    tickFormatter={formatDollarAxis}
                  />
                )}
                
                {/* Right Y-axis for count metrics */}
                {hasCountMetrics && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 14 }}
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
                    stroke={metricColors[metric]}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                    yAxisId={getAxisId(metric)}
                  />
                ))}

                {/* Previous period lines (if comparison is enabled) */}
                {showComparison && selectedMetrics.map((metric) => (
                  <Line
                    key={`${metric}-prev`}
                    type="monotone"
                    dataKey={`previousYear.${metric}`}
                    stroke={metricColors[metric]}
                    strokeWidth={3}
                    strokeDasharray="8 8"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    opacity={0.7}
                    yAxisId={getAxisId(metric)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicChartModal;
