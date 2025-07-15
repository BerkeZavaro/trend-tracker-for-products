
import MetricsCards from '@/components/MetricsCards';
import DynamicLineChart from '@/components/DynamicLineChart';
import PerformanceTable from '@/components/PerformanceTable';
import RecommendationsPanel from '@/components/RecommendationsPanel';
import { useData } from '@/contexts/DataContext';

interface ProductAnalysisProps {
  selectedProduct: string;
  appliedTimeFrame: { start: string; end: string };
  appliedAnalysisType: 'summary' | 'detailed';
}

const ProductAnalysis = ({ selectedProduct, appliedTimeFrame, appliedAnalysisType }: ProductAnalysisProps) => {
  const { getUniqueProducts } = useData();
  
  // Get the product name from the selected product ID
  const getProductName = () => {
    const products = getUniqueProducts();
    const product = products.find(p => p.id === selectedProduct);
    return product ? product.name : 'Unknown Product';
  };

  const productName = getProductName();

  return (
    <>
      {/* Product Name Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Analysis</h2>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-600">Selected Product:</span>
            <span className="text-lg font-semibold text-blue-900">{productName}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <MetricsCards 
        productId={selectedProduct} 
        timeFrame={appliedTimeFrame}
      />

      {/* Dynamic Line Chart */}
      <div className="mb-8">
        <DynamicLineChart 
          productId={selectedProduct} 
          timeFrame={appliedTimeFrame}
        />
      </div>

      {/* Performance Table */}
      {appliedAnalysisType === 'detailed' && (
        <PerformanceTable 
          productId={selectedProduct} 
          timeFrame={appliedTimeFrame}
        />
      )}

      {/* Recommendations */}
      <RecommendationsPanel 
        productId={selectedProduct} 
        timeFrame={appliedTimeFrame}
      />
    </>
  );
};

export default ProductAnalysis;
