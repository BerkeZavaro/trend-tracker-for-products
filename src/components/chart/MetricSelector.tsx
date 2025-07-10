
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export type MetricType = 'revenue' | 'adSpend' | 'totalCost' | 'orders' | 'adjustedCpa' | 'avgOrderValue' | 'profit';

interface MetricSelectorProps {
  selectedMetrics: MetricType[];
  onMetricsChange: (metrics: MetricType[]) => void;
}

const METRIC_LABELS: Record<MetricType, string> = {
  revenue: 'Revenue',
  adSpend: 'Ad Spend',
  totalCost: 'Total Cost',
  orders: 'Orders',
  adjustedCpa: 'Adjusted CPA',
  avgOrderValue: 'Avg Order Value',
  profit: 'Profit'
};

const MetricSelector = ({ selectedMetrics, onMetricsChange }: MetricSelectorProps) => {
  const handleMetricToggle = (metric: MetricType) => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter(m => m !== metric));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  const getSelectedLabel = () => {
    if (selectedMetrics.length === 0) return 'Select metrics to display';
    if (selectedMetrics.length === 1) return METRIC_LABELS[selectedMetrics[0]];
    return `${selectedMetrics.length} metrics selected`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          {getSelectedLabel()}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {Object.entries(METRIC_LABELS).map(([key, label]) => (
          <DropdownMenuCheckboxItem
            key={key}
            checked={selectedMetrics.includes(key as MetricType)}
            onCheckedChange={() => handleMetricToggle(key as MetricType)}
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MetricSelector;
