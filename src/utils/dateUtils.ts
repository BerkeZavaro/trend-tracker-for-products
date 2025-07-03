
// Helper function to parse date strings and compare them properly
export const isDateInRange = (itemMonth: string, startDate: string, endDate: string) => {
  console.log('=== Date Comparison Debug ===');
  console.log('Item month:', itemMonth, 'Start:', startDate, 'End:', endDate);
  
  // Handle numeric months (1-12) by converting to YYYY-MM format
  // Assume data is from 2024-2025 range for now
  let parsedItemDate = '';
  
  if (itemMonth.match(/^\d{1,2}$/)) {
    // Numeric month like "1", "10", "11"
    const monthNum = parseInt(itemMonth);
    // Assume months 1-6 are 2025, 7-12 are 2024 (adjust as needed)
    const year = monthNum <= 6 ? 2025 : 2024;
    parsedItemDate = `${year}-${monthNum.toString().padStart(2, '0')}`;
  } else if (itemMonth.match(/^\d{4}-\d{2}$/)) {
    // Already in YYYY-MM format
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
