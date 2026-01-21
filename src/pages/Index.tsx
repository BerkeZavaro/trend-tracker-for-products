
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import AppHeader from '@/components/layout/AppHeader';
import ExcelUpload from '@/components/ExcelUpload';
import TimeFrameSection from '@/components/sections/TimeFrameSection';
import ProductSelectionSection from '@/components/sections/ProductSelectionSection';
import PortfolioOverview from '@/components/sections/PortfolioOverview';
import ProductAnalysis from '@/components/sections/ProductAnalysis';

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [pendingTimeFrame, setPendingTimeFrame] = useState<{ start: string; end: string }>({
    start: '2024-01',
    end: '2025-06'
  });
  const [appliedTimeFrame, setAppliedTimeFrame] = useState<{ start: string; end: string }>({
    start: '2024-01',
    end: '2025-06'
  });
  const [pendingAnalysisType, setPendingAnalysisType] = useState<'summary' | 'detailed'>('summary');
  const [appliedAnalysisType, setAppliedAnalysisType] = useState<'summary' | 'detailed'>('summary');
  const { isDataLoaded } = useData();

  const hasUnappliedChanges = 
    pendingTimeFrame.start !== appliedTimeFrame.start || 
    pendingTimeFrame.end !== appliedTimeFrame.end ||
    pendingAnalysisType !== appliedAnalysisType;

  const handleApplyAnalysis = () => {
    setAppliedTimeFrame(pendingTimeFrame);
    setAppliedAnalysisType(pendingAnalysisType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <AppHeader appliedTimeFrame={appliedTimeFrame} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Excel Upload Section */}
        <ExcelUpload />

        {/* Portfolio Overview Section - Show when data is loaded but no product selected */}
        {isDataLoaded && !selectedProduct && (
          <>
            {/* Time Frame Section for Portfolio */}
            <TimeFrameSection
              pendingTimeFrame={pendingTimeFrame}
              setPendingTimeFrame={setPendingTimeFrame}
              hasUnappliedChanges={hasUnappliedChanges}
              handleApplyAnalysis={handleApplyAnalysis}
              isPortfolio={true}
            />

            <PortfolioOverview 
              appliedTimeFrame={appliedTimeFrame}
              onProductSelect={setSelectedProduct}
            />
          </>
        )}

        {/* Product Selection Section */}
        <ProductSelectionSection 
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
        />

        {/* Time Frame and Analysis Type Section */}
        {selectedProduct && isDataLoaded && (
          <TimeFrameSection
            pendingTimeFrame={pendingTimeFrame}
            setPendingTimeFrame={setPendingTimeFrame}
            pendingAnalysisType={pendingAnalysisType}
            setPendingAnalysisType={setPendingAnalysisType}
            hasUnappliedChanges={hasUnappliedChanges}
            handleApplyAnalysis={handleApplyAnalysis}
            isPortfolio={false}
          />
        )}

        {/* Product Analysis Section */}
        {selectedProduct && isDataLoaded && (
          <ProductAnalysis 
            selectedProduct={selectedProduct}
            appliedTimeFrame={appliedTimeFrame}
            appliedAnalysisType={appliedAnalysisType}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
