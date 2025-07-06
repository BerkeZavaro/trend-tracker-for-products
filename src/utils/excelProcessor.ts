
import * as XLSX from 'xlsx';
import { ProductData } from '@/contexts/DataContext';

// Flexible column mapping - handles various column name formats
export const getColumnValue = (row: any, possibleNames: string[]) => {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return null;
};

// Define possible column name variations (case-insensitive)
export const columnMappings = {
  id: ['Product ID', 'product id', 'id', 'ID', 'Product_ID', 'product_id', 'ProductID'],
  name: ['Product Name', 'product name', 'name', 'Name', 'Product_Name', 'product_name', 'ProductName'],
  category: ['Category', 'category', 'CATEGORY', 'Product Category', 'product category'],
  brand: ['Brand', 'brand', 'BRAND', 'Product Brand', 'product brand'],
  month: ['DATE', 'Date', 'date', 'Month', 'month', 'MONTH', 'Period', 'period'],
  revenue: ['Revenue', 'revenue', 'REVENUE', 'Sales', 'sales', 'Total Revenue', 'total revenue'],
  adSpend: ['Ad Spend', 'ad spend', 'adspend', 'AdSpend', 'Ad_Spend', 'Advertising Spend', 'PPC Spend'],
  nonAdCosts: ['Non-Ad Costs', 'non ad costs', 'nonAdCosts', 'Non_Ad_Costs', 'Other Costs', 'Operating Costs'],
  thirdPartyCosts: [
    'Third Party Costs', 'third party costs', 'thirdPartyCosts', 'Third_Party_Costs', 'External Costs',
    '3rd Party Costs', '3rd party costs', '3rdPartyCosts', '3rd_Party_Costs', '3rd_party_costs',
    'Third-Party Costs', '3rd-Party Costs', 'third-party costs', '3rd-party costs'
  ],
  orders: ['Orders', 'orders', 'ORDERS', 'Order Count', 'order count', 'Total Orders']
};

export const processExcelFile = async (file: File) => {
  console.log('=== Starting File Processing ===');
  console.log('File:', file.name, file.size, 'bytes');
  
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  console.log('Excel sheet name:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('Raw Excel data:', jsonData.length, 'rows');
  console.log('Sample raw data:', jsonData.slice(0, 2));

  return jsonData;
};
