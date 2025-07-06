
import { ProductData } from '@/contexts/DataContext';

export interface DateAnalysis {
  suggestedYearMapping: Map<string, number>;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  detectedRange: { start: string; end: string };
  hasDateColumn: boolean;
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
  
  // Check if we have DATE column format (YYYY-MM, MM/YYYY, or text dates)
  const hasDateColumn = Array.from(uniqueMonths).some(month => 
    month.match(/^\d{4}-\d{2}$/) || // YYYY-MM
    month.match(/^\d{1,2}\/\d{4}$/) || // MM/YYYY
    month.match(/^\d{4}\/\d{1,2}$/) || // YYYY/MM
    month.match(/^[A-Za-z]{3,9}\s+\d{4}$/) // Month Year
  );
  
  // Analyze only numeric months (old format)
  const numericMonths = Array.from(uniqueMonths)
    .filter(month => month.match(/^\d{1,2}$/))
    .map(month => parseInt(month))
    .sort((a, b) => a - b);
  
  const suggestedYearMapping = new Map<string, number>();
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  if (hasDateColumn) {
    confidence = 'high';
    warnings.push('DATE column detected - using combined date format');
  } else if (numericMonths.length > 0) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Simple year assignment strategy for old format
    numericMonths.forEach(month => {
      const year = month > currentMonth ? currentYear - 1 : currentYear;
      suggestedYearMapping.set(month.toString(), year);
    });
    
    if (numericMonths.length > 6) {
      confidence = 'medium';
      warnings.push('Large date range detected with numeric months - consider using DATE column format');
    }
  }
  
  // Calculate detected range
  const allNormalizedDates: string[] = [];
  Array.from(uniqueMonths).forEach(month => {
    if (month.match(/^\d{4}-\d{2}$/)) {
      allNormalizedDates.push(month);
    } else if (month.match(/^\d{1,2}\/\d{4}$/)) {
      const [monthPart, yearPart] = month.split('/');
      allNormalizedDates.push(`${yearPart}-${monthPart.padStart(2, '0')}`);
    } else if (month.match(/^\d{4}\/\d{1,2}$/)) {
      const [yearPart, monthPart] = month.split('/');
      allNormalizedDates.push(`${yearPart}-${monthPart.padStart(2, '0')}`);
    } else if (month.match(/^[A-Za-z]{3,9}\s+\d{4}$/)) {
      // Handle text dates
      const [monthName, year] = month.split(' ');
      const monthMap: { [key: string]: string } = {
        'jan': '01', 'january': '01', 'feb': '02', 'february': '02',
        'mar': '03', 'march': '03', 'apr': '04', 'april': '04',
        'may': '05', 'jun': '06', 'june': '06', 'jul': '07', 'july': '07',
        'aug': '08', 'august': '08', 'sep': '09', 'september': '09',
        'oct': '10', 'october': '10', 'nov': '11', 'november': '11',
        'dec': '12', 'december': '12'
      };
      const monthNum = monthMap[monthName.toLowerCase()];
      if (monthNum) {
        allNormalizedDates.push(`${year}-${monthNum}`);
      }
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
    detectedRange,
    hasDateColumn
  };
};
