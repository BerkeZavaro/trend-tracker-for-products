
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, RefreshCw, Loader2 } from 'lucide-react';
import ComparisonSelector from '@/components/chart/ComparisonSelector';
import { ComparisonConfig } from '@/types/comparisonTypes';

interface TimeFrameSectionProps {
  pendingTimeFrame: { start: string; end: string };
  setPendingTimeFrame: (timeFrame: { start: string; end: string }) => void;
  pendingAnalysisType?: 'summary' | 'detailed';
  setPendingAnalysisType?: (type: 'summary' | 'detailed') => void;
  pendingComparisonConfig?: ComparisonConfig;
  setPendingComparisonConfig?: (config: ComparisonConfig) => void;
  hasUnappliedChanges: boolean;
  handleApplyAnalysis: () => void;
  isPortfolio?: boolean;
  isLoading?: boolean;
}

const TimeFrameSection = ({
  pendingTimeFrame,
  setPendingTimeFrame,
  pendingAnalysisType,
  setPendingAnalysisType,
  pendingComparisonConfig,
  setPendingComparisonConfig,
  hasUnappliedChanges,
  handleApplyAnalysis,
  isPortfolio = false,
  isLoading = false
}: TimeFrameSectionProps) => {
  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {isPortfolio ? 'Portfolio Analysis Time Frame' : 'Time Frame & Analysis Settings'}
          {isLoading && (
            <div className="flex items-center gap-2 ml-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-normal text-muted-foreground">Detecting dates...</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 ${isPortfolio ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4 mb-4`}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Start Date</label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                type="month"
                value={pendingTimeFrame.start}
                onChange={(e) => setPendingTimeFrame({ ...pendingTimeFrame, start: e.target.value })}
                className="w-full"
              />
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">End Date</label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                type="month"
                value={pendingTimeFrame.end}
                onChange={(e) => setPendingTimeFrame({ ...pendingTimeFrame, end: e.target.value })}
                className="w-full"
              />
            )}
          </div>

          {/* Comparison Selector */}
          {pendingComparisonConfig && setPendingComparisonConfig && (
            <ComparisonSelector
              comparisonConfig={pendingComparisonConfig}
              onComparisonChange={setPendingComparisonConfig}
            />
          )}
          
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
            {hasUnappliedChanges && !isLoading && (
              <Badge variant="secondary" className="text-xs">
                Changes pending
              </Badge>
            )}
          </div>
          <Button 
            onClick={handleApplyAnalysis}
            disabled={!hasUnappliedChanges || isLoading}
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
