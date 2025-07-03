
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface UploadAreaProps {
  dragActive: boolean;
  isProcessing: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
}

const UploadArea = ({
  dragActive,
  isProcessing,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect
}: UploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
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
  );
};

export default UploadArea;
