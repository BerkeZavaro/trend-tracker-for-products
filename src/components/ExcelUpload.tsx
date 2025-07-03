
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData, ProductData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

const ExcelUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setUploadedData, isDataLoaded } = useData();
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateExcelData = (data: any[]): ProductData[] => {
    const validatedData: ProductData[] = [];
    
    data.forEach((row, index) => {
      // Skip header row
      if (index === 0) return;
      
      try {
        const productData: ProductData = {
          id: String(row['Product ID'] || row['id'] || `PROD${index}`).trim(),
          name: String(row['Product Name'] || row['name'] || 'Unknown Product').trim(),
          category: String(row['Category'] || row['category'] || 'General').trim(),
          brand: String(row['Brand'] || row['brand'] || 'Unknown Brand').trim(),
          month: String(row['Month'] || row['month'] || '2024-01').trim(),
          revenue: Number(row['Revenue'] || row['revenue'] || 0),
          adSpend: Number(row['Ad Spend'] || row['adSpend'] || 0),
          nonAdCosts: Number(row['Non-Ad Costs'] || row['nonAdCosts'] || 0),
          thirdPartyCosts: Number(row['Third Party Costs'] || row['thirdPartyCosts'] || 0),
          orders: Number(row['Orders'] || row['orders'] || 0),
        };

        // Basic validation
        if (productData.id && productData.name && productData.revenue >= 0) {
          validatedData.push(productData);
        }
      } catch (error) {
        console.warn(`Skipping invalid row ${index}:`, error);
      }
    });

    return validatedData;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const validatedData = validateExcelData(jsonData);
      
      if (validatedData.length === 0) {
        throw new Error('No valid data found in the Excel file');
      }

      setUploadedData(validatedData);
      setUploadedFile(file);
      
      toast({
        title: "File uploaded successfully",
        description: `Processed ${validatedData.length} records from ${file.name}`,
      });

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
              <p>Required columns: Product ID, Product Name, Month, Revenue, Orders</p>
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">File Uploaded Successfully</h4>
                  <p className="text-sm text-green-700">
                    {uploadedFile?.name} • Ready for analysis
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
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelUpload;
