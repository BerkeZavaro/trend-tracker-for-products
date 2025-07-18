
import { ComparisonConfig } from '@/types/comparisonTypes';

export const calculatePrecedingPeriod = (startDate: string, endDate: string) => {
  const start = new Date(startDate + '-01');
  const end = new Date(endDate + '-01');
  
  // Calculate the number of months in the selected period
  const periodLength = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth()) + 1;
  
  // Calculate preceding period end (one month before start)
  const precedingEnd = new Date(start);
  precedingEnd.setMonth(precedingEnd.getMonth() - 1);
  
  // Calculate preceding period start
  const precedingStart = new Date(precedingEnd);
  precedingStart.setMonth(precedingStart.getMonth() - periodLength + 1);
  
  return {
    start: precedingStart.toISOString().slice(0, 7),
    end: precedingEnd.toISOString().slice(0, 7)
  };
};

export const getComparisonPeriod = (
  mainStart: string, 
  mainEnd: string, 
  comparisonConfig: ComparisonConfig
) => {
  switch (comparisonConfig.type) {
    case 'previousYear':
      const startYear = parseInt(mainStart.split('-')[0]) - 1;
      const endYear = parseInt(mainEnd.split('-')[0]) - 1;
      const startMonth = mainStart.split('-')[1];
      const endMonth = mainEnd.split('-')[1];
      return {
        start: `${startYear}-${startMonth}`,
        end: `${endYear}-${endMonth}`
      };
    
    case 'precedingPeriod':
      return calculatePrecedingPeriod(mainStart, mainEnd);
    
    default:
      return null;
  }
};

export const getComparisonLabel = (comparisonConfig: ComparisonConfig) => {
  switch (comparisonConfig.type) {
    case 'previousYear':
      return 'Previous Year';
    case 'precedingPeriod':
      return 'Preceding Period';
    default:
      return '';
  }
};

export const formatComparisonMonth = (dateString: string): string => {
  const [year, month] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
};

export const getComparisonLabelWithDate = (comparisonConfig: ComparisonConfig, dateString: string): string => {
  const baseLabel = getComparisonLabel(comparisonConfig);
  if (!baseLabel || !dateString) return baseLabel;
  
  const formattedDate = formatComparisonMonth(dateString);
  return `${baseLabel} ${formattedDate}`;
};

export const calculatePreviousYearMonth = (currentMonth: string): string => {
  // Extract month and year from "Sep 2024" format
  const monthYearMatch = currentMonth.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch;
    const previousYear = parseInt(year) - 1;
    return `${month} ${previousYear}`;
  }
  return currentMonth;
};
