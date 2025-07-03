
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet } from 'lucide-react';
import { useData, ProductData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { processExcelFile } from '@/utils/excelProcessor';
import { validateExcelData } from '@/utils/excelValidator';
import UploadArea from '@/components/excel/UploadArea';
import FileStatus from '@/components/excel/FileStatus';
import DataPreview from '@/components/excel/DataPreview';

const ExcelUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataPreview, setDataPreview] = useState<ProductData[]>([]);
  const [columnInfo, setColumnInfo] = useState<{detected: string[], missing: string[]}>({detected: [], missing: []});
  const { setUploadedData, isDataLoaded } = useData();
  const { toast } = useToast();

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const jsonData = await processExcelFile(file);
      const { validatedData, issues, columnInfo: colInfo } = validateExcelData(jsonData);
      
      // Set preview data and column info
      setDataPreview(validatedData.slice(0, 5));
      setColumnInfo(colInfo);
      
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

  const handleFileSelect = (file: File) => {
    processFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedData([]);
    setDataPreview([]);
    setColumnInfo({detected: [], missing: []});
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
          <UploadArea
            dragActive={dragActive}
            isProcessing={isProcessing}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
          />
        ) : (
          <div className="space-y-4">
            <FileStatus
              fileName={uploadedFile?.name || 'Unknown file'}
              productCount={dataPreview.length}
              onRemove={removeFile}
            />
            <DataPreview
              dataPreview={dataPreview}
              columnInfo={columnInfo}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelUpload;
