import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, X, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData, ProductData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

const ExcelUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [columnInfo, setColumnInfo] = useState<{detected: string[], missing: string[]}>({detected: [], missing: []});
  const { setUploadedData, isDataLoaded } = useData();
  const { toast } = useToast();

  // Flexible column mapping - handles various column name formats
  const getColumnValue = (row: any, possibleNames: string[]) => {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return row[name];
      }
    }
    return null;
  };

  const validateExcelData = (data: any[]): { validatedData: ProductData[], issues: string[] } => {
    console.log('=== Excel Data Validation Debug ===');
    console.log('Total rows in Excel:', data.length);
    console.log('First few rows:', data.slice(0, 3));
    
    if (data.length === 0) {
      return { validatedData: [], issues: ['Excel file appears to be empty'] };
    }

    // Get column names from first row
    const headers = Object.keys(data[0] || {});
    console.log('Detected column headers:', headers);
    
    const validatedData: ProductData[] = [];
    const issues: string[] = [];
    let skippedRows = 0;
    
    // Define possible column name variations (case-insensitive)
    const columnMappings = {
      id: ['Product ID', 'product id', 'id', 'ID', 'Product_ID', 'product_id', 'ProductID'],
      name: ['Product Name', 'product name', 'name', 'Name', 'Product_Name', 'product_name', 'ProductName'],
      category: ['Category', 'category', 'CATEGORY', 'Product Category', 'product category'],
      brand: ['Brand', 'brand', 'BRAND', 'Product Brand', 'product brand'],
      month: ['Month', 'month', 'MONTH', 'Date', 'date', 'Period', 'period'],
      revenue: ['Revenue', 'revenue', 'REVENUE', 'Sales', 'sales', 'Total Revenue', 'total revenue'],
      adSpend: ['Ad Spend', 'ad spend', 'adspend', 'AdSpend', 'Ad_Spend', 'Advertising Spend', 'PPC Spend'],
      nonAdCosts: ['Non-Ad Costs', 'non ad costs', 'nonAdCosts', 'Non_Ad_Costs', 'Other Costs', 'Operating Costs'],
      thirdPartyCosts: ['Third Party Costs', 'third party costs', 'thirdPartyCosts', 'Third_Party_Costs', 'External Costs'],
      orders: ['Orders', 'orders', 'ORDERS', 'Order Count', 'order count', 'Total Orders']
    };

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
    
    setColumnInfo({ detected: detectedColumns, missing: missingColumns });
    
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

    return { validatedData, issues };
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    console.log('=== Starting File Processing ===');
    console.log('File:', file.name, file.size, 'bytes');
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      console.log('Excel sheet name:', sheetName);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Raw Excel data:', jsonData.length, 'rows');
      console.log('Sample raw data:', jsonData.slice(0, 2));

      const { validatedData, issues } = validateExcelData(jsonData);
      
      // Set preview data for debugging
      setDataPreview(validatedData.slice(0, 5));
      
      if (validatedData.length === 0) {
        throw new Error(`No valid data found. Issues: ${issues.join('; ')}`);
      }

      console.log('Setting validated data:', validatedData.length, 'products');
      setUploadedData(validatedData);
      setUploadedFile(file);
      
      toast({
        title: "File uploaded successfully",
        description: `Processed ${validatedData.length} records from ${file.name}${issues.length > 0 ? '. Some issues detected - check preview.' : ''}`,
      });

      if (issues.length > 0) {
        console.warn('Upload issues:', issues);
      }

    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process the Excel file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xlsx, .xls) or CSV file",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedData([]);
    setDataPreview([]);
    setColumnInfo({detected: [], missing: []});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "File removed",
      description: "Data has been cleared from the analyzer"
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-6">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          Upload Excel Data
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload your product performance data in Excel format to begin analysis
        </p>
      </CardHeader>
      <CardContent>
        {!isDataLoaded ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isProcessing ? 'Processing...' : 'Upload Excel File'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your Excel file here, or click to browse
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="mb-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Choose File'}
            </Button>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Supported formats: .xlsx, .xls, .csv</p>
              <p>Required: Product Name (other columns optional)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">File Uploaded Successfully</h4>
                    <p className="text-sm text-green-700">
                      {uploadedFile?.name} • {dataPreview.length} products loaded
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>

            {/* Data Preview */}
            {dataPreview.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Data Preview</h4>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium text-green-700">Detected Columns:</p>
                      <p className="text-green-600">{columnInfo.detected.join(', ') || 'None'}</p>
                    </div>
                    {columnInfo.missing.length > 0 && (
                      <div>
                        <p className="font-medium text-orange-700">Missing/Optional:</p>
                        <p className="text-orange-600">{columnInfo.missing.join(', ')}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-xs">
                    <p className="font-medium text-blue-700 mb-1">Sample Products:</p>
                    {dataPreview.slice(0, 3).map((product, i) => (
                      <p key={i} className="text-blue-600">
                        • {product.name} ({product.id}) - Revenue: ${product.revenue}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelUpload;
