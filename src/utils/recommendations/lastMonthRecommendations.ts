
import { ProductData } from '@/contexts/DataContext';
import { EnhancedRecommendation, LastMonthAnalysis } from '@/types/recommendations';
import { getPerformanceGrade } from './performanceGrading';
import { AlertTriangle, TrendingUp, Target, BarChart3 } from 'lucide-react';

export const generateLastMonthRecommendations = (
  lastMonthAnalysis: LastMonthAnalysis
): EnhancedRecommendation[] => {
  const recommendations: EnhancedRecommendation[] = [];
  
  if (!lastMonthAnalysis.lastMonth) {
    return recommendations;
  }

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
        description: `${lastMonthAnalysis.lastMonth.month} showed very efficient acquisition costs relative to average sale.`,
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
        description: `${lastMonthAnalysis.lastMonth.month} showed concerning cost efficiency with high Adjusted CPA relative to average sale.`,
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

  return recommendations;
};
