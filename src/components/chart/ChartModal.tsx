
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import ChartTooltip from './ChartTooltip';
import TrendLegend from './TrendLegend';
import { formatValue } from '@/utils/chartUtils';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Array<{
    month: string;
    value: number;
    previousYear: number | null;
    averageSale?: number;
    previousYearAverageSale?: number | null;
    saleCpaDifference?: number;
  }>;
  metric: 'revenue' | 'cpa';
  title: string;
  trend: 'up' | 'down';
  trendPercent: number;
}

const ChartModal = ({ isOpen, onClose, data, metric, title, trend, trendPercent }: ChartModalProps) => {
  const isRevenue = metric === 'revenue';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>{title}</span>
              <div className="flex items-center gap-2">
                {trend === 'up' ? (
                  <TrendingUp className={`w-5 h-5 ${isRevenue ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <TrendingDown className={`w-5 h-5 ${isRevenue ? 'text-red-600' : 'text-green-600'}`} />
                )}
                <span className={`text-lg font-medium ${
                  (isRevenue && trend === 'up') || (!isRevenue && trend === 'down') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {trendPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <div className="h-[calc(100vh-200px)] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id={`${metric}GradientModal`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isRevenue ? "#10b981" : "#3b82f6"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isRevenue ? "#10b981" : "#3b82f6"} stopOpacity={0}/>
                  </linearGradient>
                  {!isRevenue && (
                    <linearGradient id="differenceGradientModal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                  )}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 14 }}
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 14 }}
                  stroke="#6b7280"
                  tickFormatter={(value) => formatValue(value, isRevenue)}
                />
                <Tooltip content={<ChartTooltip isRevenue={isRevenue} />} />
                
                {/* For Revenue charts: single area with gradient */}
                {isRevenue && (
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#revenueGradientModal)"
                  />
                )}
                
                {/* For CPA charts: blue base area + orange difference area stacked */}
                {!isRevenue && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#cpaGradientModal)"
                      stackId="cpa"
                    />
                    <Area
                      type="monotone"
                      dataKey="saleCpaDifference"
                      stroke="transparent"
                      fill="url(#differenceGradientModal)"
                      stackId="cpa"
                    />
                  </>
                )}
                
                {!isRevenue && (
                  <Line
                    type="monotone"
                    dataKey="averageSale"
                    stroke="#f97316"
                    strokeWidth={4}
                    dot={false}
                    connectNulls={false}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="previousYear"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                {!isRevenue && (
                  <Line
                    type="monotone"
                    dataKey="previousYearAverageSale"
                    stroke="#fb923c"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <TrendLegend isRevenue={isRevenue} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartModal;
