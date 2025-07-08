
import { ProductData } from '@/contexts/DataContext';
import { EnhancedRecommendation, LastMonthAnalysis } from '@/types/recommendations';
import { analyzeTimeSeries, generatePredictions } from '@/utils/advancedAnalytics';
import { Zap } from 'lucide-react';

export const generatePredictionRecommendations = (
  lastMonthAnalysis: LastMonthAnalysis,
  filteredData: ProductData[],
  allData: ProductData[],
  uploadedData: ProductData[]
): EnhancedRecommendation[] => {
  const recommendations: EnhancedRecommendation[] = [];
  
  if (!lastMonthAnalysis.lastMonth) {
    return recommendations;
  }

  const analysis = analyzeTimeSeries(filteredData, allData, uploadedData);

  // Future predictions based on last month trends
  const predictions = generatePredictions(analysis);
  if (predictions.confidence === 'high' || predictions.confidence === 'medium') {
    const lastMonthRevenue = lastMonthAnalysis.lastMonthMetrics.revenue;
    const isPositivePrediction = predictions.nextMonthRevenue > lastMonthRevenue;
    
    recommendations.push({
      type: 'strategic',
      priority: predictions.confidence === 'high' ? 'medium' : 'low',
      title: `${predictions.confidence === 'high' ? 'High' : 'Medium'} Confidence Prediction`,
      description: `Based on last month's performance and trends, next month's revenue is predictable with ${predictions.confidence} confidence.`,
      dataInsight: `Last month: $${lastMonthRevenue.toLocaleString()}, Predicted next month: $${predictions.nextMonthRevenue.toLocaleString()} (${predictions.confidence} confidence)`,
      action: isPositivePrediction ? 'Prepare for growth - scale operations and marketing' : 'Implement cost controls and defensive strategies',
      expectedImpact: 'Proactively manage expected performance changes',
      timeframe: 'next-month',
      icon: Zap,
      color: isPositivePrediction ? 'green' : 'orange',
      source: 'validation'
    });
  }

  return recommendations;
};
