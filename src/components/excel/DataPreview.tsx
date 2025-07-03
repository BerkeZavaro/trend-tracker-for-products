
import React from 'react';
import { ProductData } from '@/contexts/DataContext';
import { Eye } from 'lucide-react';

interface DataPreviewProps {
  dataPreview: ProductData[];
  columnInfo: {
    detected: string[];
    missing: string[];
  };
}

const DataPreview = ({ dataPreview, columnInfo }: DataPreviewProps) => {
  if (dataPreview.length === 0) return null;

  return (
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
  );
};

export default DataPreview;
