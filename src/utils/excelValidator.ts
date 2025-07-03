
import { ProductData } from '@/contexts/DataContext';
import { getColumnValue, columnMappings } from './excelProcessor';

export const validateExcelData = (data: any[]): { validatedData: ProductData[], issues: string[], columnInfo: {detected: string[], missing: string[]} } => {
  console.log('=== Excel Data Validation Debug ===');
  console.log('Total rows in Excel:', data.length);
  console.log('First few rows:', data.slice(0, 3));
  
  if (data.length === 0) {
    return { 
      validatedData: [], 
      issues: ['Excel file appears to be empty'],
      columnInfo: { detected: [], missing: [] }
    };
  }

  // Get column names from first row
  const headers = Object.keys(data[0] || {});
  console.log('Detected column headers:', headers);
  
  const validatedData: ProductData[] = [];
  const issues: string[] = [];
  let skippedRows = 0;

  // Check which columns we can detect
  const detectedColumns: string[] = [];
  const missingColumns: string[] = [];
  
  Object.entries(columnMappings).forEach(([key, variations]) => {
    const found = variations.some(variation => 
      headers.some(header => header.toLowerCase().includes(variation.toLowerCase()) || 
                           variation.toLowerCase().includes(header.toLowerCase()))
    );
    if (found) {
      detectedColumns.push(key);
    } else {
      missingColumns.push(key);
    }
  });

  console.log('Detected columns:', detectedColumns);
  console.log('Missing columns:', missingColumns);
  
  data.forEach((row, index) => {
    try {
      // Extract values using flexible mapping
      const id = getColumnValue(row, columnMappings.id);
      const name = getColumnValue(row, columnMappings.name);
      const category = getColumnValue(row, columnMappings.category);
      const brand = getColumnValue(row, columnMappings.brand);
      const month = getColumnValue(row, columnMappings.month);
      const revenue = getColumnValue(row, columnMappings.revenue);
      const adSpend = getColumnValue(row, columnMappings.adSpend);
      const nonAdCosts = getColumnValue(row, columnMappings.nonAdCosts);
      const thirdPartyCosts = getColumnValue(row, columnMappings.thirdPartyCosts);
      const orders = getColumnValue(row, columnMappings.orders);

      console.log(`Row ${index} extracted values:`, { id, name, revenue, orders });

      // More flexible validation - only require essential fields
      if (!name || name.toString().trim() === '') {
        skippedRows++;
        return; // Skip rows without product name
      }

      const productData: ProductData = {
        id: id ? String(id).trim() : `PROD${index}`,
        name: String(name).trim(),
        category: category ? String(category).trim() : 'General',
        brand: brand ? String(brand).trim() : 'Unknown Brand',
        month: month ? String(month).trim() : '2024-01',
        revenue: revenue ? Number(revenue) || 0 : 0,
        adSpend: adSpend ? Number(adSpend) || 0 : 0,
        nonAdCosts: nonAdCosts ? Number(nonAdCosts) || 0 : 0,
        thirdPartyCosts: thirdPartyCosts ? Number(thirdPartyCosts) || 0 : 0,
        orders: orders ? Number(orders) || 0 : 0,
      };

      // Very basic validation - just check if we have a name
      if (productData.name && productData.name !== 'Unknown Product') {
        validatedData.push(productData);
      } else {
        skippedRows++;
      }
    } catch (error) {
      console.warn(`Error processing row ${index}:`, error);
      skippedRows++;
    }
  });

  console.log(`Validation complete: ${validatedData.length} valid rows, ${skippedRows} skipped`);
  
  if (skippedRows > 0) {
    issues.push(`Skipped ${skippedRows} rows due to missing essential data`);
  }
  
  if (missingColumns.length > 0) {
    issues.push(`Some columns not detected: ${missingColumns.join(', ')}`);
  }

  return { validatedData, issues, columnInfo: { detected: detectedColumns, missing: missingColumns } };
};
