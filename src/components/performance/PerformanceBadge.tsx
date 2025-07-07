
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceBadgeProps {
  rating: string;
  isProfitable: boolean;
}

const PerformanceBadge = ({ rating, isProfitable }: PerformanceBadgeProps) => {
  if (rating === 'excellent') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Excellent
      </Badge>
    );
  } else if (rating === 'good' && isProfitable) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <TrendingUp className="w-3 h-3 mr-1" />
        Good
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Poor
      </Badge>
    );
  }
};

export default PerformanceBadge;
