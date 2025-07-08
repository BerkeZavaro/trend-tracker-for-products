
import { ProductData } from '@/contexts/DataContext';
import { EnhancedRecommendation, LastMonthAnalysis, TimeframeAnalysis } from '@/types/recommendations';
import { generateTimeframeRecommendations } from './timeframeRecommendations';
import { generateLastMonthRecommendations } from './lastMonthRecommendations';
import { generateValidationRecommendations } from './validationRecommendations';
import { generatePredictionRecommendations } from './predictionRecommendations';

export const generateRecommendationsFromAnalysis = (
  lastMonthAnalysis: LastMonthAnalysis,
  timeframeAnalysis: TimeframeAnalysis,
  filteredData: ProductData[],
  allData: ProductData[],
  uploadedData: ProductData[],
  timeFrame: { start: string; end: string }
): EnhancedRecommendation[] => {
  const recommendations: EnhancedRecommendation[] = [];
  
  // Generate timeframe-based recommendations first
  const timeframeRecommendations = generateTimeframeRecommendations(timeframeAnalysis, filteredData, timeFrame);
  recommendations.push(...timeframeRecommendations);
  
  // Generate last month specific recommendations
  const lastMonthRecommendations = generateLastMonthRecommendations(lastMonthAnalysis);
  recommendations.push(...lastMonthRecommendations);
  
  // Generate validation/comparison recommendations
  const validationRecommendations = generateValidationRecommendations(
    lastMonthAnalysis,
    timeframeAnalysis,
    filteredData,
    allData,
    uploadedData
  );
  recommendations.push(...validationRecommendations);
  
  // Generate prediction-based recommendations
  const predictionRecommendations = generatePredictionRecommendations(
    lastMonthAnalysis,
    filteredData,
    allData,
    uploadedData
  );
  recommendations.push(...predictionRecommendations);

  // Sort by priority and return balanced recommendations (mix of sources)
  const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
  const sortedRecommendations = recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  
  // Ensure we have a good mix of recommendation sources
  const timeframeRecs = sortedRecommendations.filter(r => r.source === 'timeframe').slice(0, 2);
  const lastMonthRecs = sortedRecommendations.filter(r => r.source === 'last-month').slice(0, 3);
  const validationRecs = sortedRecommendations.filter(r => r.source === 'validation').slice(0, 2);
  
  return [...timeframeRecs, ...lastMonthRecs, ...validationRecs].slice(0, 7);
};
