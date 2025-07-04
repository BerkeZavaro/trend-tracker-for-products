
import { ProductData } from '@/contexts/DataContext';
import { analyzeDataDates } from './smartDateDetection';

let cachedDateAnalysis: any = null;
let cachedDataHash: string = '';

// Lightweight hash generation - only use data length and sample items
const generateDataHash = (data: ProductData[]): string => {
  if (data.length === 0) return 'empty';
  
  // Use length + first/last items for lightweight hash
  const sample = data.length > 2 ? 
    `${data.length}-${data[0].id}-${data[data.length-1].id}` : 
    `${data.length}-${data[0]?.id || 'none'}`;
  
  return sample;
};

// Clear all caches - called when new data is uploaded
export const clearSessionCache = () => {
  console.log('Clearing session cache');
  cachedDateAnalysis = null;
  cachedDataHash = '';
};

export const getDateAnalysis = (data: ProductData[]) => {
  const currentHash = generateDataHash(data);
  
  if (cachedDataHash !== currentHash || !cachedDateAnalysis) {
    cachedDateAnalysis = analyzeDataDates(data);
    cachedDataHash = currentHash;
  }
  
  return cachedDateAnalysis;
};

export const smartNormalizeDate = (month: string, allData: ProductData[]): string => {
  // Handle YYYY-MM format
  if (month.match(/^\d{4}-\d{2}$/)) {
    return month;
  }
  
  // Handle numeric months with smart year detection
  if (month.match(/^\d{1,2}$/)) {
    const analysis = getDateAnalysis(allData);
    const suggestedYear = analysis.suggestedYearMapping.get(month);
    
    if (suggestedYear) {
      return `${suggestedYear}-${month.padStart(2, '0')}`;
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
  const parsedItemDate = smartNormalizeDate(itemMonth, allData);
  return parsedItemDate >= startDate && parsedItemDate <= endDate;
};
