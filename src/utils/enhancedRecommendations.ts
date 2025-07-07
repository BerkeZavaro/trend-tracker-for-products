
import { ProductData } from '@/contexts/DataContext';
import { analyzeTimeSeries, generatePredictions, TimeSeriesAnalysis } from './advancedAnalytics';
import { AlertTriangle, TrendingUp, Target, Lightbulb, Calendar, DollarSign, BarChart3, Zap } from 'lucide-react';

export interface EnhancedRecommendation {
  type: 'strategic' | 'tactical' | 'warning' | 'opportunity';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dataInsight: string;
  action: string;
  expectedImpact: string;
  timeframe: 'immediate' | 'next-month' | 'next-quarter';
  icon: any;
  color: string;
}

export const generateEnhancedRecommendations = (
  filteredData: ProductData[],
  allData: ProductData[],
  uploadedData: ProductData[],
  timeFrame: { start: string; end: string }
): EnhancedRecommendation[] => {
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

  const analysis = analyzeTimeSeries(filteredData, allData, uploadedData);
  const predictions = generatePredictions(analysis);
  const recommendations: EnhancedRecommendation[] = [];

  // Current period performance analysis
  const currentMetrics = calculateCurrentMetrics(filteredData);
  const latestMonth = filteredData[filteredData.length - 1];

  // Strategic Recommendations based on trends
  if (analysis.trends.revenueDirection === 'up' && analysis.trends.momentum === 'accelerating') {
    recommendations.push({
      type: 'strategic',
      priority: 'high',
      title: 'Scale Investment - Strong Growth Momentum',
      description: 'Revenue is growing with accelerating momentum. This is the optimal time to increase investment.',
      dataInsight: `Revenue increased ${analysis.monthToMonth.slice(-1)[0]?.changePercent.toFixed(1)}% last month with accelerating trend`,
      action: 'Increase ad spend by 30-50% and expand to new channels',
      expectedImpact: 'Potential 25-40% revenue growth next month',
      timeframe: 'immediate',
      icon: TrendingUp,
      color: 'green'
    });
  }

  if (analysis.trends.revenueDirection === 'down' && analysis.trends.momentum === 'decelerating') {
    recommendations.push({
      type: 'warning',
      priority: 'critical',
      title: 'Revenue Decline - Immediate Action Required',
      description: 'Revenue is declining with negative momentum. Urgent intervention needed.',
      dataInsight: `Revenue dropped ${Math.abs(analysis.monthToMonth.slice(-1)[0]?.changePercent || 0).toFixed(1)}% with worsening trend`,
      action: 'Audit all marketing channels, review targeting, and optimize underperforming campaigns',
      expectedImpact: 'Stop revenue decline and stabilize performance',
      timeframe: 'immediate',
      icon: AlertTriangle,
      color: 'red'
    });
  }

  // Year-over-Year Analysis
  const yoyData = analysis.yearOverYear.filter(item => item.previousYear > 0);
  if (yoyData.length > 0) {
    const avgYoyGrowth = yoyData.reduce((sum, item) => sum + item.changePercent, 0) / yoyData.length;
    
    if (avgYoyGrowth > 20) {
      recommendations.push({
        type: 'opportunity',
        priority: 'high',
        title: 'Exceptional Year-over-Year Growth',
        description: 'Significantly outperforming previous year - capitalize on this success.',
        dataInsight: `Average ${avgYoyGrowth.toFixed(1)}% growth vs. same period last year`,
        action: 'Document successful strategies and replicate across similar periods',
        expectedImpact: 'Sustain high growth rates',
        timeframe: 'next-month',
        icon: BarChart3,
        color: 'purple'
      });
    } else if (avgYoyGrowth < -10) {
      recommendations.push({
        type: 'warning',
        priority: 'high',
        title: 'Underperforming vs. Previous Year',
        description: 'Performance significantly below last year - investigate root causes.',
        dataInsight: `Average ${Math.abs(avgYoyGrowth).toFixed(1)}% decline vs. same period last year`,
        action: 'Compare strategies from successful previous year and identify changes',
        expectedImpact: 'Recover to previous year performance levels',
        timeframe: 'next-month',
        icon: TrendingUp,
        color: 'orange'
      });
    }
  }

  // Efficiency Analysis
  if (currentMetrics.avgCPA > 0 && currentMetrics.avgSale > 0) {
    const cpaToSaleRatio = currentMetrics.avgCPA / currentMetrics.avgSale;
    
    if (cpaToSaleRatio < 0.3) {
      recommendations.push({
        type: 'opportunity',
        priority: 'high',
        title: 'Excellent Cost Efficiency - Scale Opportunity',
        description: 'Your cost per acquisition is very efficient relative to sale value.',
        dataInsight: `CPA is only ${(cpaToSaleRatio * 100).toFixed(1)}% of average sale value ($${currentMetrics.avgCPA.toFixed(2)} vs $${currentMetrics.avgSale.toFixed(2)})`,
        action: 'Increase budget by 40-60% while maintaining current targeting',
        expectedImpact: 'Potentially double revenue while maintaining profitability',
        timeframe: 'immediate',
        icon: Target,
        color: 'green'
      });
    } else if (cpaToSaleRatio > 0.8) {
      recommendations.push({
        type: 'tactical',
        priority: 'critical',
        title: 'Cost Efficiency Crisis - Immediate Optimization',
        description: 'Acquisition costs are dangerously high relative to sale value.',
        dataInsight: `CPA represents ${(cpaToSaleRatio * 100).toFixed(1)}% of average sale value, leaving minimal profit margin`,
        action: 'Pause low-performing campaigns, tighten targeting, and review pricing strategy',
        expectedImpact: 'Reduce CPA by 30-50% within 2 weeks',
        timeframe: 'immediate',
        icon: AlertTriangle,
        color: 'red'
      });
    }
  }

  // Seasonality Insights
  if (analysis.seasonality.isSeasonalBusiness) {
    const currentMonth = latestMonth.month.split('-')[1];
    const isBestSeason = analysis.seasonality.bestMonths.includes(currentMonth);
    const isWorstSeason = analysis.seasonality.worstMonths.includes(currentMonth);
    
    if (isBestSeason) {
      recommendations.push({
        type: 'strategic',
        priority: 'high',
        title: 'Peak Season - Maximum Investment Opportunity',
        description: 'Currently in one of your historically best performing months.',
        dataInsight: `Month ${currentMonth} is typically a top 3 performing month for your business`,
        action: 'Maximize ad spend and inventory during this peak period',
        expectedImpact: 'Capture full seasonal upside potential',
        timeframe: 'immediate',
        icon: Calendar,
        color: 'purple'
      });
    } else if (isWorstSeason) {
      recommendations.push({
        type: 'tactical',
        priority: 'medium',
        title: 'Off-Season Strategy - Focus on Efficiency',
        description: 'Currently in a historically weaker performing period.',
        dataInsight: `Month ${currentMonth} is typically among your lowest performing months`,
        action: 'Reduce spend, focus on retention, and prepare for next peak season',
        expectedImpact: 'Preserve profitability during slow period',
        timeframe: 'next-month',
        icon: Lightbulb,
        color: 'blue'
      });
    }
  }

  // Profit Margin Analysis
  if (currentMetrics.profitMargin < 15 && currentMetrics.profitMargin > -50) {
    recommendations.push({
      type: 'warning',
      priority: 'high',
      title: 'Profit Margin Under Pressure',
      description: 'Profit margins are below healthy thresholds and need immediate attention.',
      dataInsight: `Current profit margin is ${currentMetrics.profitMargin.toFixed(1)}%, well below the 25% target`,
      action: 'Review all cost components and consider price increases',
      expectedImpact: 'Improve margin to sustainable 20%+ level',
      timeframe: 'next-month',
      icon: DollarSign,
      color: 'orange'
    });
  }

  // Future Predictions
  if (predictions.confidence === 'high') {
    const isPositivePrediction = predictions.nextMonthRevenue > currentMetrics.avgRevenue;
    recommendations.push({
      type: 'strategic',
      priority: 'medium',
      title: `High Confidence ${isPositivePrediction ? 'Growth' : 'Decline'} Prediction`,
      description: `Based on current trends, next month's performance is highly predictable.`,
      dataInsight: `Predicted next month revenue: $${predictions.nextMonthRevenue.toLocaleString()} (${predictions.confidence} confidence)`,
      action: isPositivePrediction ? 'Prepare for increased demand and scale operations' : 'Implement defensive strategies and cost controls',
      expectedImpact: 'Proactively manage expected performance changes',
      timeframe: 'next-month',
      icon: Zap,
      color: isPositivePrediction ? 'green' : 'orange'
    });
  }

  // Sort by priority and return top recommendations
  const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
  return recommendations
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 8); // Limit to top 8 recommendations
};

const calculateCurrentMetrics = (data: ProductData[]) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalCosts = data.reduce((sum, item) => sum + item.adSpend + item.nonAdCosts + item.thirdPartyCosts, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  
  return {
    avgRevenue: totalRevenue / data.length,
    totalRevenue,
    totalCosts,
    profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0,
    avgCPA: totalOrders > 0 ? totalCosts / totalOrders : 0,
    avgSale: totalOrders > 0 ? totalRevenue / totalOrders : 0
  };
};
