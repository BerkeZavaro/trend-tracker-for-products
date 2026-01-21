
import { useState, useEffect, useMemo } from 'react';
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
  const [hasInitializedTimeFrame, setHasInitializedTimeFrame] = useState(false);
  const { isDataLoaded, uploadedData } = useData();

  // Calculate the date range from uploaded data
  const dataDateRange = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return null;
    
    const months = uploadedData
      .map(item => item.month)
      .filter(month => month && typeof month === 'string')
      .sort();
    
    if (months.length === 0) return null;
    
    return {
      start: months[0],
      end: months[months.length - 1]
    };
  }, [uploadedData]);

  // Set default END date based on latest month in data when first loaded
  useEffect(() => {
    if (dataDateRange && !hasInitializedTimeFrame) {
      // Convert dataDateRange.end from "M/YYYY" to "YYYY-MM" for the date picker
      let formattedEnd = dataDateRange.end;
      
      // If it's in M/YYYY or MM/YYYY format, convert to YYYY-MM
      const slashMatch = dataDateRange.end.match(/^(\d{1,2})\/(\d{4})$/);
      if (slashMatch) {
        const month = slashMatch[1].padStart(2, '0');
        const year = slashMatch[2];
        formattedEnd = `${year}-${month}`;
      }
      
      const newTimeFrame = {
        start: pendingTimeFrame.start, // Keep existing start date (2024-01)
        end: formattedEnd // Set end to latest month in data (formatted for picker)
      };
      setPendingTimeFrame(newTimeFrame);
      setAppliedTimeFrame(newTimeFrame);
      setHasInitializedTimeFrame(true);
    }
  }, [dataDateRange, hasInitializedTimeFrame]);

  // Reset initialization flag when data is cleared
  useEffect(() => {
    if (!isDataLoaded) {
      setHasInitializedTimeFrame(false);
    }
  }, [isDataLoaded]);

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
