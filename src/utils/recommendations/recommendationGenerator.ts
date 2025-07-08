
import { ProductData } from '@/contexts/DataContext';
import { EnhancedRecommendation, LastMonthAnalysis, TimeframeAnalysis } from '@/types/recommendations';
import { analyzeTimeSeries, generatePredictions } from '@/utils/advancedAnalytics';
import { getPerformanceGrade } from './performanceGrading';
import { generateTimeframeRecommendations } from './timeframeRecommendations';
import { AlertTriangle, TrendingUp, Target, Lightbulb, Calendar, Zap, BarChart3 } from 'lucide-react';

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
  
  // If no last month data, return only timeframe recommendations
  if (!lastMonthAnalysis.lastMonth) {
    return recommendations;
  }

  const analysis = analyzeTimeSeries(filteredData, allData, uploadedData);

  // Primary recommendation based on last month's performance grade
  const performanceGrade = getPerformanceGrade(lastMonthAnalysis.lastMonthMetrics);
  const contextNote = lastMonthAnalysis.isOutlier ? ` (Note: ${lastMonthAnalysis.outlierReason})` : '';
  
  recommendations.push({
    type: 'opportunity',
    priority: lastMonthAnalysis.lastMonthMetrics.profitMargin < 15 ? 'high' : 'medium',
    title: `Last Month Performance: ${performanceGrade.grade}`,
    description: `${lastMonthAnalysis.lastMonth.month} generated $${lastMonthAnalysis.lastMonthMetrics.revenue.toLocaleString()} in revenue with ${lastMonthAnalysis.lastMonthMetrics.profitMargin.toFixed(1)}% profit margin.${contextNote}`,
    dataInsight: `Revenue: $${lastMonthAnalysis.lastMonthMetrics.revenue.toLocaleString()}, Profit: $${lastMonthAnalysis.lastMonthMetrics.profit.toLocaleString()}, Adjusted CPA: $${lastMonthAnalysis.lastMonthMetrics.adjustedCpa.toFixed(2)}, Orders: ${lastMonthAnalysis.lastMonthMetrics.orders}`,
    action: performanceGrade.action,
    expectedImpact: performanceGrade.impact,
    timeframe: 'next-month',
    icon: BarChart3,
    color: performanceGrade.color,
    source: 'last-month'
  });

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

  // Month-over-month trend analysis (if previous month exists)
  if (lastMonthAnalysis.previousMonth && Math.abs(lastMonthAnalysis.monthOverMonthChange.revenue) > 5) {
    const isPositive = lastMonthAnalysis.monthOverMonthChange.revenue > 0;
    const revenueChange = Math.abs(lastMonthAnalysis.monthOverMonthChange.revenue);
    
    recommendations.push({
      type: isPositive ? 'opportunity' : 'warning',
      priority: revenueChange > 20 ? 'high' : 'medium',
      title: `${isPositive ? 'Revenue Growth' : 'Revenue Decline'} Last Month`,
      description: `Revenue ${isPositive ? 'increased' : 'decreased'} ${revenueChange.toFixed(1)}% from ${lastMonthAnalysis.previousMonth.month} to ${lastMonthAnalysis.lastMonth.month}.`,
      dataInsight: `Revenue: ${lastMonthAnalysis.previousMonth.month} $${lastMonthAnalysis.previousMonth.revenue.toLocaleString()} → ${lastMonthAnalysis.lastMonth.month} $${lastMonthAnalysis.lastMonth.revenue.toLocaleString()}`,
      action: isPositive ? 'Double down on successful strategies from last month' : 'Identify and address factors that caused last month\'s decline',
      expectedImpact: isPositive ? 'Maintain growth momentum' : 'Prevent further revenue decline',
      timeframe: 'immediate',
      icon: isPositive ? TrendingUp : AlertTriangle,
      color: isPositive ? 'green' : 'orange',
      source: 'last-month'
    });
  }

  // Cost efficiency analysis based on last month
  const lastMonthCpaToSaleRatio = lastMonthAnalysis.lastMonthMetrics.avgSale > 0 ? 
    lastMonthAnalysis.lastMonthMetrics.adjustedCpa / lastMonthAnalysis.lastMonthMetrics.avgSale : 0;
  
  if (lastMonthCpaToSaleRatio > 0) {
    if (lastMonthCpaToSaleRatio < 0.4) {
      recommendations.push({
        type: 'opportunity',
        priority: 'high',
        title: 'Excellent Adjusted CPA Efficiency Last Month',
        description: `${lastMonthAnalysis.lastMonth.month} showed very efficient acquisition costs relative to sale value.`,
        dataInsight: `Last month Adjusted CPA: $${lastMonthAnalysis.lastMonthMetrics.adjustedCpa.toFixed(2)}, Average sale: $${lastMonthAnalysis.lastMonthMetrics.avgSale.toFixed(2)} (${(lastMonthCpaToSaleRatio * 100).toFixed(1)}% ratio)`,
        action: 'Scale marketing spend by 30-50% while maintaining current targeting and creative strategies',
        expectedImpact: 'Increase revenue by 40-60% while maintaining profitability',
        timeframe: 'immediate',
        icon: Target,
        color: 'green',
        source: 'last-month'
      });
    } else if (lastMonthCpaToSaleRatio > 0.6) {
      recommendations.push({
        type: 'warning',
        priority: lastMonthCpaToSaleRatio > 0.8 ? 'critical' : 'high',
        title: 'High Adjusted CPA Last Month',
        description: `${lastMonthAnalysis.lastMonth.month} showed concerning cost efficiency with high Adjusted CPA relative to sale value.`,
        dataInsight: `Last month Adjusted CPA: $${lastMonthAnalysis.lastMonthMetrics.adjustedCpa.toFixed(2)}, Average sale: $${lastMonthAnalysis.lastMonthMetrics.avgSale.toFixed(2)} (${(lastMonthCpaToSaleRatio * 100).toFixed(1)}% ratio)`,
        action: 'Immediate optimization of ad targeting, pause underperforming campaigns, or review pricing strategy',
        expectedImpact: 'Reduce costs and improve profit margins by 20-30%',
        timeframe: 'immediate',
        icon: AlertTriangle,
        color: 'red',
        source: 'last-month'
      });
    }
  }

  // Adjusted CPA trend analysis (if previous month exists)
  if (lastMonthAnalysis.previousMonth && Math.abs(lastMonthAnalysis.monthOverMonthChange.adjustedCpa) > 10) {
    const cpaImproved = lastMonthAnalysis.monthOverMonthChange.adjustedCpa < 0;
    const cpaChange = Math.abs(lastMonthAnalysis.monthOverMonthChange.adjustedCpa);
    
    recommendations.push({
      type: cpaImproved ? 'opportunity' : 'warning',
      priority: cpaChange > 25 ? 'high' : 'medium',
      title: `Adjusted CPA ${cpaImproved ? 'Improved' : 'Worsened'} Last Month`,
      description: `Adjusted CPA ${cpaImproved ? 'decreased' : 'increased'} ${cpaChange.toFixed(1)}% from previous month.`,
      dataInsight: `Adjusted CPA change: ${lastMonthAnalysis.previousMonth.month} $${lastMonthAnalysis.previousMonth.adjustedCpa.toFixed(2)} → ${lastMonthAnalysis.lastMonth.month} $${lastMonthAnalysis.lastMonthMetrics.adjustedCpa.toFixed(2)}`,
      action: cpaImproved ? 'Analyze what drove Adjusted CPA improvement and replicate those tactics' : 'Investigate Adjusted CPA increase and optimize underperforming channels',
      expectedImpact: cpaImproved ? 'Maintain efficient acquisition costs' : 'Restore cost efficiency',
      timeframe: 'immediate',
      icon: cpaImproved ? Target : AlertTriangle,
      color: cpaImproved ? 'green' : 'orange',
      source: 'last-month'
    });
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

  // Sort by priority and return balanced recommendations (mix of sources)
  const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
  const sortedRecommendations = recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  
  // Ensure we have a good mix of recommendation sources
  const timeframeRecs = sortedRecommendations.filter(r => r.source === 'timeframe').slice(0, 2);
  const lastMonthRecs = sortedRecommendations.filter(r => r.source === 'last-month').slice(0, 3);
  const validationRecs = sortedRecommendations.filter(r => r.source === 'validation').slice(0, 2);
  
  return [...timeframeRecs, ...lastMonthRecs, ...validationRecs].slice(0, 7);
};
