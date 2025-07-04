import { isDateInRange as enhancedIsDateInRange } from './enhancedDateUtils';
import { ProductData } from '@/contexts/DataContext';

// Keep original function for backward compatibility but use enhanced version
export const isDateInRange = (itemMonth: string, startDate: string, endDate: string, allData?: ProductData[]) => {
  if (allData) {
    return enhancedIsDateInRange(itemMonth, startDate, endDate, allData);
  }
  
  // Original logic as fallback
  console.log('=== Date Comparison Debug (Fallback) ===');
  console.log('Item month:', itemMonth, 'Start:', startDate, 'End:', endDate);
  
  let parsedItemDate = '';
  
  if (itemMonth.match(/^\d{1,2}$/)) {
    const monthNum = parseInt(itemMonth);
    const year = monthNum <= 6 ? 2025 : 2024;
    parsedItemDate = `${year}-${monthNum.toString().padStart(2, '0')}`;
  } else if (itemMonth.match(/^\d{4}-\d{2}$/)) {
    parsedItemDate = itemMonth;
  } else {
    console.warn('Unrecognized date format:', itemMonth);
    return false;
  }
  
  console.log('Parsed item date:', parsedItemDate);
  const inRange = parsedItemDate >= startDate && parsedItemDate <= endDate;
  console.log('In range?', inRange);
  return inRange;
};
