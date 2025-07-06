
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

  // Check if DATE column is present
  const hasDateColumn = headers.some(header => 
    header.toLowerCase().trim() === 'date'
  );

  // Check which columns we can detect with improved matching
  const detectedColumns: string[] = [];
  const missingColumns: string[] = [];
  
  Object.entries(columnMappings).forEach(([key, variations]) => {
    console.log(`Checking for ${key} column with variations:`, variations);
    
    const found = variations.some(variation => {
      const match = headers.some(header => {
        const headerLower = header.toLowerCase().trim();
        const variationLower = variation.toLowerCase().trim();
        
        // Exact match
        if (headerLower === variationLower) {
          console.log(`✓ Exact match found for ${key}: "${header}" matches "${variation}"`);
          return true;
        }
        
        // Contains match
        if (headerLower.includes(variationLower) || variationLower.includes(headerLower)) {
          console.log(`✓ Contains match found for ${key}: "${header}" contains/matches "${variation}"`);
          return true;
        }
        
        return false;
      });
      return match;
    });
    
    if (found) {
      detectedColumns.push(key);
      console.log(`✓ ${key} column detected`);
    } else {
      missingColumns.push(key);
      console.log(`✗ ${key} column NOT detected`);
    }
  });

  console.log('Final detected columns:', detectedColumns);
  console.log('Final missing columns:', missingColumns);
  
  // Add feedback about DATE column detection
  if (hasDateColumn) {
    issues.push('✓ DATE column detected - using combined date format for better accuracy');
  }
  
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

      console.log(`Row ${index} extracted values:`, { id, name, revenue, orders, month });

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
