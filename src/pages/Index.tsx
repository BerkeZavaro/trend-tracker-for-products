
import { useState, useEffect, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import AppHeader from '@/components/layout/AppHeader';
import ExcelUpload from '@/components/ExcelUpload';
import TimeFrameSection from '@/components/sections/TimeFrameSection';
import ProductSelectionSection from '@/components/sections/ProductSelectionSection';
import PortfolioOverview from '@/components/sections/PortfolioOverview';
import ProductAnalysis from '@/components/sections/ProductAnalysis';
import { analyzeDataDates } from '@/utils/smartDateDetection';

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
  const { isDataLoaded, uploadedData } = useData();
  
  // Track if we've already auto-applied for this dataset
  const lastAppliedDataLength = useRef<number>(0);

  // Auto-detect date range from uploaded data and apply immediately
  useEffect(() => {
    if (uploadedData.length > 0 && uploadedData.length !== lastAppliedDataLength.current) {
      const dateAnalysis = analyzeDataDates(uploadedData);
      const detectedRange = dateAnalysis.detectedRange;
      
      if (detectedRange.start && detectedRange.end) {
        // Update both pending and applied time frames
        setPendingTimeFrame(detectedRange);
        setAppliedTimeFrame(detectedRange);
        lastAppliedDataLength.current = uploadedData.length;
        console.log('Auto-detected date range:', detectedRange);
      }
    }
  }, [uploadedData]);

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
