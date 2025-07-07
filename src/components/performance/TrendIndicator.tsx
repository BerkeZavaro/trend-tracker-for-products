
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface TrendIndicatorProps {
  trend: 'improving' | 'declining' | 'stable';
}

const TrendIndicator = ({ trend }: TrendIndicatorProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <ArrowRight className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {getTrendIcon(trend)}
      <span className={`text-xs font-medium ${
        trend === 'improving' ? 'text-green-600' :
        trend === 'declining' ? 'text-red-600' : 'text-gray-500'
      }`}>
        {getTrendLabel(trend)}
      </span>
    </div>
  );
};

export default TrendIndicator;
