
import { ProductData } from '@/contexts/DataContext';

export interface DateAnalysis {
  suggestedYearMapping: Map<string, number>;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  detectedRange: { start: string; end: string };
}

export const analyzeDataDates = (data: ProductData[]): DateAnalysis => {
  console.log('=== Smart Date Detection Analysis ===');
  console.log('Total data points:', data.length);
  
  const warnings: string[] = [];
  const monthCounts = new Map<string, number>();
  const monthData = new Map<string, ProductData[]>();
  
  // Group data by month and collect statistics
  data.forEach(item => {
    const month = item.month;
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    if (!monthData.has(month)) {
      monthData.set(month, []);
    }
    monthData.get(month)!.push(item);
  });
  
  console.log('Month distribution:', Object.fromEntries(monthCounts));
  
  // Analyze numeric months
  const numericMonths = Array.from(monthCounts.keys()).filter(month => 
    month.match(/^\d{1,2}$/)
  ).map(month => parseInt(month)).sort((a, b) => a - b);
  
  console.log('Detected numeric months:', numericMonths);
  
  const suggestedYearMapping = new Map<string, number>();
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  if (numericMonths.length > 0) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Strategy 1: Look for sequential patterns
    const hasSequentialPattern = numericMonths.length > 1 && 
      numericMonths.every((month, index) => 
        index === 0 || month === numericMonths[index - 1] + 1 || 
        (numericMonths[index - 1] === 12 && month === 1)
      );
    
    if (hasSequentialPattern) {
      console.log('Sequential pattern detected');
      // If we have sequential months, assign years chronologically
      numericMonths.forEach((month, index) => {
        let year = currentYear;
        if (month > currentMonth || index < numericMonths.length / 2) {
          year = currentYear - 1;
        }
        suggestedYearMapping.set(month.toString(), year);
      });
    } else {
      // Strategy 2: Revenue-based analysis
      console.log('Analyzing revenue patterns for year assignment');
      const monthRevenues = new Map<string, number>();
      
      numericMonths.forEach(month => {
        const monthStr = month.toString();
        const items = monthData.get(monthStr) || [];
        const avgRevenue = items.reduce((sum, item) => sum + (item.revenue || 0), 0) / items.length;
        monthRevenues.set(monthStr, avgRevenue);
      });
      
      // Assume higher revenue months are more recent
      const sortedByRevenue = numericMonths.sort((a, b) => 
        (monthRevenues.get(b.toString()) || 0) - (monthRevenues.get(a.toString()) || 0)
      );
      
      sortedByRevenue.forEach((month, index) => {
        const year = index < sortedByRevenue.length / 2 ? currentYear : currentYear - 1;
        suggestedYearMapping.set(month.toString(), year);
      });
      
      confidence = 'medium';
      warnings.push('Year assignment based on revenue patterns - please verify');
    }
  }
  
  // Calculate detected range
  const allNormalizedDates: string[] = [];
  Array.from(monthCounts.keys()).forEach(month => {
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
  
  console.log('Suggested year mapping:', Object.fromEntries(suggestedYearMapping));
  console.log('Confidence:', confidence);
  console.log('Detected range:', detectedRange);
  
  return {
    suggestedYearMapping,
    confidence,
    warnings,
    detectedRange
  };
};
