
import { ProductData } from '@/contexts/DataContext';
import { EnhancedRecommendation, LastMonthAnalysis, TimeframeAnalysis } from '@/types/recommendations';
import { analyzeTimeSeries } from '@/utils/advancedAnalytics';
import { AlertTriangle, TrendingUp, Calendar, Lightbulb } from 'lucide-react';

export const generateValidationRecommendations = (
  lastMonthAnalysis: LastMonthAnalysis,
  timeframeAnalysis: TimeframeAnalysis,
  filteredData: ProductData[],
  allData: ProductData[],
  uploadedData: ProductData[]
): EnhancedRecommendation[] => {
  const recommendations: EnhancedRecommendation[] = [];
  
  if (!lastMonthAnalysis.lastMonth) {
    return recommendations;
  }

  const analysis = analyzeTimeSeries(filteredData, allData, uploadedData);

  // Validation: Compare last month to timeframe average
  if (timeframeAnalysis.timeframeMetrics.monthCount > 1) {
    const lastMonthVsAvg = ((lastMonthAnalysis.lastMonthMetrics.revenue - timeframeAnalysis.timeframeMetrics.avgRevenue) / timeframeAnalysis.timeframeMetrics.avgRevenue) * 100;
    
    if (Math.abs(lastMonthVsAvg) > 15) {
      recommendations.push({
        type: 'tactical',
        priority: Math.abs(lastMonthVsAvg) > 30 ? 'high' : 'medium',
        title: `Last Month ${lastMonthVsAvg > 0 ? 'Outperformed' : 'Underperformed'} Period Average`,
        description: `${lastMonthAnalysis.lastMonth.month} revenue was ${Math.abs(lastMonthVsAvg).toFixed(1)}% ${lastMonthVsAvg > 0 ? 'above' : 'below'} your ${timeframeAnalysis.timeframeMetrics.monthCount}-month average.`,
        dataInsight: `Last month: $${lastMonthAnalysis.lastMonthMetrics.revenue.toLocaleString()}, Period average: $${timeframeAnalysis.timeframeMetrics.avgRevenue.toLocaleString()} (${lastMonthVsAvg > 0 ? '+' : ''}${lastMonthVsAvg.toFixed(1)}%)`,
        action: lastMonthVsAvg > 0 ? 'Analyze what drove above-average performance to replicate success' : 'Investigate underperformance factors and course-correct quickly',
        expectedImpact: lastMonthVsAvg > 0 ? 'Maintain momentum from strong performance' : 'Return to average or above-average performance levels',
        timeframe: 'immediate',
        icon: lastMonthVsAvg > 0 ? TrendingUp : AlertTriangle,
        color: lastMonthVsAvg > 0 ? 'green' : 'orange',
        source: 'validation'
      });
    }
  }

  // Seasonality context (using historical data)
  if (analysis.seasonality.isSeasonalBusiness) {
    const currentMonth = lastMonthAnalysis.lastMonth.month.split('-')[1];
    const isBestSeason = analysis.seasonality.bestMonths.includes(currentMonth);
    const isWorstSeason = analysis.seasonality.worstMonths.includes(currentMonth);
    
    if (isBestSeason) {
      recommendations.push({
        type: 'strategic',
        priority: 'high',
        title: 'Peak Season Performance Context',
        description: `${lastMonthAnalysis.lastMonth.month} is historically a strong performing month for your business.`,
        dataInsight: `Month ${currentMonth} typically ranks among your top performing months based on historical data`,
        action: 'Prepare for continued strong performance and ensure adequate inventory/capacity',
        expectedImpact: 'Maximize seasonal revenue opportunity',
        timeframe: 'next-month',
        icon: Calendar,
        color: 'purple',
        source: 'validation'
      });
    } else if (isWorstSeason) {
      recommendations.push({
        type: 'tactical',
        priority: 'medium',
        title: 'Off-Season Performance Context',
        description: `${lastMonthAnalysis.lastMonth.month} is historically a slower performing period.`,
        dataInsight: `Month ${currentMonth} typically ranks among lower performing months based on historical patterns`,
        action: 'Focus on efficiency optimization and prepare for next peak season',
        expectedImpact: 'Maintain profitability during slower period',
        timeframe: 'next-month',
        icon: Lightbulb,
        color: 'blue',
        source: 'validation'
      });
    }
  }

  return recommendations;
};
