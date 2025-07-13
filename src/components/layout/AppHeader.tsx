
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar } from 'lucide-react';

interface AppHeaderProps {
  appliedTimeFrame: { start: string; end: string };
}

const AppHeader = ({ appliedTimeFrame }: AppHeaderProps) => {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              Product Performance Analyzer
            </h1>
            <p className="text-gray-600 mt-1">Analyze performance across PPC, email, and direct sales channels</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="w-4 h-4 mr-2" />
              {appliedTimeFrame.start} to {appliedTimeFrame.end}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
