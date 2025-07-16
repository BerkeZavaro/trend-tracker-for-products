
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ComparisonType, ComparisonConfig } from '@/types/comparisonTypes';

interface ComparisonSelectorProps {
  comparisonConfig: ComparisonConfig;
  onComparisonChange: (config: ComparisonConfig) => void;
}

const ComparisonSelector = ({ comparisonConfig, onComparisonChange }: ComparisonSelectorProps) => {
  const handleTypeChange = (type: ComparisonType) => {
    onComparisonChange({
      type,
      customRange: type === 'customRange' ? { start: '', end: '' } : undefined
    });
  };

  const handleCustomRangeChange = (field: 'start' | 'end', value: string) => {
    if (comparisonConfig.type === 'customRange') {
      onComparisonChange({
        ...comparisonConfig,
        customRange: {
          ...comparisonConfig.customRange!,
          [field]: value
        }
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Comparison</label>
        <Select value={comparisonConfig.type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Comparison</SelectItem>
            <SelectItem value="previousYear">Previous Year</SelectItem>
            <SelectItem value="precedingPeriod">Preceding Period</SelectItem>
            <SelectItem value="customRange">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {comparisonConfig.type === 'customRange' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Compare Start</label>
            <Input
              type="month"
              value={comparisonConfig.customRange?.start || ''}
              onChange={(e) => handleCustomRangeChange('start', e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Compare End</label>
            <Input
              type="month"
              value={comparisonConfig.customRange?.end || ''}
              onChange={(e) => handleCustomRangeChange('end', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonSelector;
