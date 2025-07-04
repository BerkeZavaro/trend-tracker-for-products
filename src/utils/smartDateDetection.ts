
import { ProductData } from '@/contexts/DataContext';

export interface DateAnalysis {
  suggestedYearMapping: Map<string, number>;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  detectedRange: { start: string; end: string };
}

export const analyzeDataDates = (data: ProductData[]): DateAnalysis => {
  const warnings: string[] = [];
  
  // Process only unique months for efficiency
  const uniqueMonths = new Set(data.map(item => item.month));
  const monthCounts = new Map<string, number>();
  
  // Count occurrences of each month
  data.forEach(item => {
    monthCounts.set(item.month, (monthCounts.get(item.month) || 0) + 1);
  });
  
  // Analyze only numeric months
  const numericMonths = Array.from(uniqueMonths)
    .filter(month => month.match(/^\d{1,2}$/))
    .map(month => parseInt(month))
    .sort((a, b) => a - b);
  
  const suggestedYearMapping = new Map<string, number>();
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  if (numericMonths.length > 0) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Simple year assignment strategy
    numericMonths.forEach(month => {
      const year = month > currentMonth ? currentYear - 1 : currentYear;
      suggestedYearMapping.set(month.toString(), year);
    });
    
    if (numericMonths.length > 6) {
      confidence = 'medium';
      warnings.push('Large date range detected - please verify year assignments');
    }
  }
  
  // Calculate detected range
  const allNormalizedDates: string[] = [];
  Array.from(uniqueMonths).forEach(month => {
    if (month.match(/^\d{4}-\d{2}$/)) {
      allNormalizedDates.push(month);
    } else if (month.match(/^\d{1,2}$/)) {
      const year = suggestedYearMapping.get(month) || new Date().getFullYear();
      allNormalizedDates.push(`${year}-${month.padStart(2, '0')}`);
    }
  });
  
  allNormalizedDates.sort();
  const detectedRange = {
    start: allNormalizedDates[0] || '2024-01',
    end: allNormalizedDates[allNormalizedDates.length - 1] || '2025-12'
  };
  
  return {
    suggestedYearMapping,
    confidence,
    warnings,
    detectedRange
  };
};
