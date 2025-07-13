
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw } from 'lucide-react';

interface TimeFrameSectionProps {
  pendingTimeFrame: { start: string; end: string };
  setPendingTimeFrame: (timeFrame: { start: string; end: string }) => void;
  pendingAnalysisType?: 'summary' | 'detailed';
  setPendingAnalysisType?: (type: 'summary' | 'detailed') => void;
  hasUnappliedChanges: boolean;
  handleApplyAnalysis: () => void;
  isPortfolio?: boolean;
}

const TimeFrameSection = ({
  pendingTimeFrame,
  setPendingTimeFrame,
  pendingAnalysisType,
  setPendingAnalysisType,
  hasUnappliedChanges,
  handleApplyAnalysis,
  isPortfolio = false
}: TimeFrameSectionProps) => {
  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {isPortfolio ? 'Portfolio Analysis Time Frame' : 'Time Frame & Analysis Settings'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 ${isPortfolio ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4 mb-4`}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Start Date</label>
            <Input
              type="month"
              value={pendingTimeFrame.start}
              onChange={(e) => setPendingTimeFrame({ ...pendingTimeFrame, start: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">End Date</label>
            <Input
              type="month"
              value={pendingTimeFrame.end}
              onChange={(e) => setPendingTimeFrame({ ...pendingTimeFrame, end: e.target.value })}
              className="w-full"
            />
          </div>
          
          {!isPortfolio && pendingAnalysisType && setPendingAnalysisType && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Analysis Type</label>
              <Select 
                value={pendingAnalysisType} 
                onValueChange={(value: 'summary' | 'detailed') => setPendingAnalysisType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasUnappliedChanges && (
              <Badge variant="secondary" className="text-xs">
                Changes pending
              </Badge>
            )}
          </div>
          <Button 
            onClick={handleApplyAnalysis}
            disabled={!hasUnappliedChanges}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Apply Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeFrameSection;
