
import MetricsCards from '@/components/MetricsCards';
import DynamicLineChart from '@/components/DynamicLineChart';
import PerformanceTable from '@/components/PerformanceTable';
import RecommendationsPanel from '@/components/RecommendationsPanel';

interface ProductAnalysisProps {
  selectedProduct: string;
  appliedTimeFrame: { start: string; end: string };
  appliedAnalysisType: 'summary' | 'detailed';
}

const ProductAnalysis = ({ selectedProduct, appliedTimeFrame, appliedAnalysisType }: ProductAnalysisProps) => {
  return (
    <>
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
