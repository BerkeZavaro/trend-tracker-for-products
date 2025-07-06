
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

// Enhanced date normalization that handles the new DATE column format
export const smartNormalizeDate = (month: string, allData: ProductData[]): string => {
  // Handle YYYY-MM format (already normalized)
  if (month.match(/^\d{4}-\d{2}$/)) {
    return month;
  }
  
  // Handle MM/YYYY format (convert to YYYY-MM)
  if (month.match(/^\d{1,2}\/\d{4}$/)) {
    const [monthPart, yearPart] = month.split('/');
    return `${yearPart}-${monthPart.padStart(2, '0')}`;
  }
  
  // Handle YYYY/MM format (convert to YYYY-MM)
  if (month.match(/^\d{4}\/\d{1,2}$/)) {
    const [yearPart, monthPart] = month.split('/');
    return `${yearPart}-${monthPart.padStart(2, '0')}`;
  }
  
  // Handle text dates like "Nov 2024", "November 2024"
  if (month.match(/^[A-Za-z]{3,9}\s+\d{4}$/)) {
    const [monthName, year] = month.split(' ');
    const monthMap: { [key: string]: string } = {
      'jan': '01', 'january': '01',
      'feb': '02', 'february': '02',
      'mar': '03', 'march': '03',
      'apr': '04', 'april': '04',
      'may': '05',
      'jun': '06', 'june': '06',
      'jul': '07', 'july': '07',
      'aug': '08', 'august': '08',
      'sep': '09', 'september': '09',
      'oct': '10', 'october': '10',
      'nov': '11', 'november': '11',
      'dec': '12', 'december': '12'
    };
    const monthNum = monthMap[monthName.toLowerCase()];
    if (monthNum) {
      return `${year}-${monthNum}`;
    }
  }
  
  // Handle numeric months with smart year detection (fallback for old format)
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
