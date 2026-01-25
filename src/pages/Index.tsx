
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
    end: '2024-01'
  });
  const [appliedTimeFrame, setAppliedTimeFrame] = useState<{ start: string; end: string }>({
    start: '2024-01',
    end: '2024-01'
  });
  const [pendingAnalysisType, setPendingAnalysisType] = useState<'summary' | 'detailed'>('summary');
  const [appliedAnalysisType, setAppliedAnalysisType] = useState<'summary' | 'detailed'>('summary');
  const [isDateRangeReady, setIsDateRangeReady] = useState(false);
  const { isDataLoaded, uploadedData } = useData();
  
  // Track if we've already auto-applied for this dataset
  const lastAppliedDataLength = useRef<number>(0);

  // Reset date range ready state when data is cleared
  useEffect(() => {
    if (uploadedData.length === 0) {
      setIsDateRangeReady(false);
      lastAppliedDataLength.current = 0;
    }
  }, [uploadedData.length]);

  // Auto-detect date range from uploaded data and apply immediately
  useEffect(() => {
    if (uploadedData.length > 0 && uploadedData.length !== lastAppliedDataLength.current) {
      // Mark as not ready while processing
      setIsDateRangeReady(false);
      
      const dateAnalysis = analyzeDataDates(uploadedData);
      const detectedRange = dateAnalysis.detectedRange;
      
      if (detectedRange.end) {
        // Start Date: Always January 2024
        // End Date: Auto-detected from data
        const finalRange = {
          start: '2024-01',
          end: detectedRange.end
        };
        
        // Update both pending and applied time frames
        setPendingTimeFrame(finalRange);
        setAppliedTimeFrame(finalRange);
        lastAppliedDataLength.current = uploadedData.length;
        
        // Mark as ready after processing
        setIsDateRangeReady(true);
        console.log('Auto-detected date range:', finalRange);
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
              isLoading={!isDateRangeReady}
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
            isLoading={!isDateRangeReady}
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
