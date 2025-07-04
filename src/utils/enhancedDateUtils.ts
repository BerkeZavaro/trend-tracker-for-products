
import { ProductData } from '@/contexts/DataContext';
import { analyzeDataDates } from './smartDateDetection';

let cachedDateAnalysis: any = null;
let cachedDataHash: string = '';

const generateDataHash = (data: ProductData[]): string => {
  return data.map(item => `${item.id}-${item.month}`).join('|');
};

export const getDateAnalysis = (data: ProductData[]) => {
  const currentHash = generateDataHash(data);
  
  if (cachedDataHash !== currentHash || !cachedDateAnalysis) {
    console.log('Performing fresh date analysis');
    cachedDateAnalysis = analyzeDataDates(data);
    cachedDataHash = currentHash;
  }
  
  return cachedDateAnalysis;
};

export const smartNormalizeDate = (month: string, allData: ProductData[]): string => {
  console.log('Smart normalizing date:', month);
  
  // Handle YYYY-MM format
  if (month.match(/^\d{4}-\d{2}$/)) {
    return month;
  }
  
  // Handle numeric months with smart year detection
  if (month.match(/^\d{1,2}$/)) {
    const analysis = getDateAnalysis(allData);
    const suggestedYear = analysis.suggestedYearMapping.get(month);
    
    if (suggestedYear) {
      const normalized = `${suggestedYear}-${month.padStart(2, '0')}`;
      console.log(`Smart normalized ${month} to ${normalized}`);
      return normalized;
    }
    
    // Fallback to current logic if no smart mapping available
    const monthNum = parseInt(month);
    const currentYear = new Date().getFullYear();
    const year = monthNum <= 6 ? currentYear : currentYear - 1;
    return `${year}-${monthNum.toString().padStart(2, '0')}`;
  }
  
  return month;
};

export const isDateInRange = (itemMonth: string, startDate: string, endDate: string, allData: ProductData[] = []) => {
  console.log('=== Enhanced Date Comparison Debug ===');
  console.log('Item month:', itemMonth, 'Start:', startDate, 'End:', endDate);
  
  const parsedItemDate = smartNormalizeDate(itemMonth, allData);
  
  console.log('Smart normalized date:', parsedItemDate);
  const inRange = parsedItemDate >= startDate && parsedItemDate <= endDate;
  console.log('In range?', inRange);
  return inRange;
};
