
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';

interface FileStatusProps {
  fileName: string;
  productCount: number;
  onRemove: () => void;
}

const FileStatus = ({ fileName, productCount, onRemove }: FileStatusProps) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h4 className="font-semibold text-green-900">File Uploaded Successfully</h4>
            <p className="text-sm text-green-700">
              {fileName} • {productCount} products loaded
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
        >
          <X className="w-4 h-4 mr-1" />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default FileStatus;
