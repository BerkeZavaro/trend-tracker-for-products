
export type ComparisonType = 'none' | 'previousYear' | 'precedingPeriod' | 'customRange';

export interface ComparisonConfig {
  type: ComparisonType;
  customRange?: {
    start: string;
    end: string;
  };
}
