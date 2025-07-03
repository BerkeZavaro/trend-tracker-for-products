
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface RecommendationItemProps {
  type: string;
  priority: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  action: string;
}

const RecommendationItem = ({ 
  type, 
  priority, 
  title, 
  description, 
  icon: Icon, 
  color, 
  action 
}: RecommendationItemProps) => {
  const getIconColor = (color: string) => {
    const colors = {
      green: 'text-green-600',
      red: 'text-red-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      teal: 'text-teal-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Info</Badge>;
    }
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-gray-50 ${getIconColor(color)}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {getPriorityBadge(priority)}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Suggested action:</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              {action}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationItem;
