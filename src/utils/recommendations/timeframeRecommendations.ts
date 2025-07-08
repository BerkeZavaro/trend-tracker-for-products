
import { EnhancedRecommendation, TimeframeAnalysis } from '@/types/recommendations';
import { ProductData } from '@/contexts/DataContext';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Target, AlertTriangle } from 'lucide-react';

export const generateTimeframeRecommendations = (
  timeframeAnalysis: TimeframeAnalysis,
  filteredData: ProductData[],
  timeFrame: { start: string; end: string }
): EnhancedRecommendation[] => {
  const recommendations: EnhancedRecommendation[] = [];
  const { timeframeMetrics, trendDirection, seasonalPatterns, performanceConsistency } = timeframeAnalysis;
  
  if (filteredData.length === 0) return recommendations;

  // Overall timeframe performance recommendation
  recommendations.push({
    type: 'strategic',
    priority: 'medium',
    title: `${timeframeMetrics.monthCount}-Month Period Performance Overview`,
    description: `From ${timeFrame.start} to ${timeFrame.end}, you generated $${timeframeMetrics.totalRevenue.toLocaleString()} across ${timeframeMetrics.monthCount} months with ${timeframeMetrics.avgProfitMargin.toFixed(1)}% average profit margin.`,
    dataInsight: `Average monthly revenue: $${timeframeMetrics.avgRevenue.toLocaleString()}, Total orders: ${timeframeMetrics.totalOrders}, Consistency score: ${timeframeMetrics.consistencyScore.toFixed(0)}%`,
    action: `Focus on ${performanceConsistency === 'low' ? 'improving consistency' : 'scaling successful patterns'} from this period`,
    expectedImpact: 'Better strategic planning and resource allocation',
    timeframe: 'next-quarter',
    icon: BarChart3,
    color: 'blue',
    source: 'timeframe'
  });

  // Trend direction recommendation
  if (timeframeMetrics.monthCount > 1) {
    const isPositiveTrend = trendDirection === 'improving';
    const trendMagnitude = Math.abs(timeframeMetrics.revenueGrowthRate);
    
    recommendations.push({
      type: isPositiveTrend ? 'opportunity' : 'warning',
      priority: trendMagnitude > 20 ? 'high' : 'medium',
      title: `${trendDirection === 'improving' ? 'Growth' : trendDirection === 'declining' ? 'Decline' : 'Stable'} Trend Over Period`,
      description: `Revenue ${trendDirection === 'improving' ? 'grew' : trendDirection === 'declining' ? 'declined' : 'remained stable'} ${trendMagnitude.toFixed(1)}% from ${filteredData[0]?.month} to ${filteredData[filteredData.length - 1]?.month}.`,
      dataInsight: `Period trend: ${filteredData[0]?.revenue.toLocaleString()} → ${filteredData[filteredData.length - 1]?.revenue.toLocaleString()} (${timeframeMetrics.revenueGrowthRate > 0 ? '+' : ''}${timeframeMetrics.revenueGrowthRate.toFixed(1)}%)`,
      action: isPositiveTrend ? 'Analyze and replicate growth drivers across other periods' : 'Investigate causes of decline and implement corrective measures',
      expectedImpact: isPositiveTrend ? 'Accelerate growth momentum' : 'Reverse negative trends',
      timeframe: 'next-month',
      icon: isPositiveTrend ? TrendingUp : TrendingDown,
      color: isPositiveTrend ? 'green' : 'red',
      source: 'timeframe'
    });
  }

  // Performance consistency recommendation
  if (timeframeMetrics.monthCount > 2) {
    const bestWorstDiff = ((timeframeMetrics.bestMonth.revenue - timeframeMetrics.worstMonth.revenue) / timeframeMetrics.worstMonth.revenue) * 100;
    
    recommendations.push({
      type: performanceConsistency === 'low' ? 'warning' : 'opportunity',
      priority: performanceConsistency === 'low' ? 'high' : 'medium',
      title: `${performanceConsistency === 'high' ? 'Excellent' : performanceConsistency === 'medium' ? 'Moderate' : 'Poor'} Performance Consistency`,
      description: `Your best month (${timeframeMetrics.bestMonth.month}: $${timeframeMetrics.bestMonth.revenue.toLocaleString()}) outperformed your worst month (${timeframeMetrics.worstMonth.month}: $${timeframeMetrics.worstMonth.revenue.toLocaleString()}) by ${bestWorstDiff.toFixed(0)}%.`,
      dataInsight: `Consistency score: ${timeframeMetrics.consistencyScore.toFixed(0)}%, Revenue range: $${timeframeMetrics.worstMonth.revenue.toLocaleString()} - $${timeframeMetrics.bestMonth.revenue.toLocaleString()}`,
      action: performanceConsistency === 'low' ? 'Identify factors causing volatility and standardize successful practices' : 'Maintain consistent execution while seeking incremental improvements',
      expectedImpact: performanceConsistency === 'low' ? 'Reduce revenue volatility by 30-40%' : 'Sustain reliable performance',
      timeframe: 'next-quarter',
      icon: performanceConsistency === 'low' ? AlertTriangle : Target,
      color: performanceConsistency === 'low' ? 'orange' : 'green',
      source: 'timeframe'
    });
  }

  // Seasonal patterns recommendation
  if (seasonalPatterns.length > 0) {
    recommendations.push({
      type: 'strategic',
      priority: 'medium',
      title: 'Seasonal Performance Patterns Identified',
      description: `Historical data reveals clear seasonal patterns in your business performance.`,
      dataInsight: seasonalPatterns.join('; '),
      action: 'Plan marketing spend and inventory based on these seasonal patterns',
      expectedImpact: 'Optimize resource allocation throughout the year',
      timeframe: 'next-quarter',
      icon: Calendar,
      color: 'purple',
      source: 'timeframe'
    });
  }

  // Adjusted CPA efficiency across timeframe
  if (timeframeMetrics.avgAdjustedCpa > 0) {
    const avgSaleValue = timeframeMetrics.totalOrders > 0 ? timeframeMetrics.totalRevenue / timeframeMetrics.totalOrders : 0;
    const cpaToSaleRatio = avgSaleValue > 0 ? timeframeMetrics.avgAdjustedCpa / avgSaleValue : 0;
    
    if (cpaToSaleRatio > 0) {
      recommendations.push({
        type: cpaToSaleRatio < 0.4 ? 'opportunity' : 'warning',
        priority: cpaToSaleRatio > 0.6 ? 'high' : 'medium',
        title: `${timeframeMetrics.monthCount}-Month Average Adjusted CPA Efficiency`,
        description: `Your average Adjusted CPA of $${timeframeMetrics.avgAdjustedCpa.toFixed(2)} represents ${(cpaToSaleRatio * 100).toFixed(1)}% of your average sale value over this period.`,
        dataInsight: `Period averages: Adjusted CPA $${timeframeMetrics.avgAdjustedCpa.toFixed(2)}, Sale value $${avgSaleValue.toFixed(2)}, Efficiency ratio ${(cpaToSaleRatio * 100).toFixed(1)}%`,
        action: cpaToSaleRatio < 0.4 ? 'Scale marketing investment while maintaining current efficiency levels' : 'Optimize targeting and creative to improve cost efficiency',
        expectedImpact: cpaToSaleRatio < 0.4 ? 'Increased revenue with maintained profitability' : 'Improved profit margins',
        timeframe: 'next-month',
        icon: Target,
        color: cpaToSaleRatio < 0.4 ? 'green' : 'orange',
        source: 'timeframe'
      });
    }
  }

  return recommendations;
};
