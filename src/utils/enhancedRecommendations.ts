
import { ProductData } from '@/contexts/DataContext';
import { EnhancedRecommendation } from '@/types/recommendations';
import { analyzeLastMonth } from './recommendations/lastMonthAnalysis';
import { generateRecommendationsFromAnalysis } from './recommendations/recommendationGenerator';
import { AlertTriangle } from 'lucide-react';

export const generateEnhancedRecommendations = (
  filteredData: ProductData[],
  allData: ProductData[],
  uploadedData: ProductData[],
  timeFrame: { start: string; end: string }
): EnhancedRecommendation[] => {
  console.log('Generating enhanced recommendations for', filteredData.length, 'data points');
  
  if (filteredData.length === 0) {
    return [{
      type: 'warning',
      priority: 'medium',
      title: 'No Data Available',
      description: 'No performance data found for the selected time period.',
      dataInsight: 'Selected timeframe contains no data points.',
      action: 'Adjust date range or verify data upload',
      expectedImpact: 'Enable proper analysis',
      timeframe: 'immediate',
      icon: AlertTriangle,
      color: 'orange'
    }];
  }

  const lastMonthAnalysis = analyzeLastMonth(filteredData, allData);
  console.log('Last month analysis:', lastMonthAnalysis);

  return generateRecommendationsFromAnalysis(
    lastMonthAnalysis,
    filteredData,
    allData,
    uploadedData
  );
};

// Re-export types for backward compatibility
export type { EnhancedRecommendation } from '@/types/recommendations';
