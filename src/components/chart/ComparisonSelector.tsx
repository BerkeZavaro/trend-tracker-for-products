
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComparisonType, ComparisonConfig } from '@/types/comparisonTypes';

interface ComparisonSelectorProps {
  comparisonConfig: ComparisonConfig;
  onComparisonChange: (config: ComparisonConfig) => void;
}

const ComparisonSelector = ({ comparisonConfig, onComparisonChange }: ComparisonSelectorProps) => {
  const handleTypeChange = (type: ComparisonType) => {
    onComparisonChange({ type });
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
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ComparisonSelector;
