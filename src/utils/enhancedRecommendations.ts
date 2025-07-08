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

  const analysis = analyzeTimeSeries(filteredData, allData, uploadedData);
  const predictions = generatePredictions(analysis);
  const recommendations: EnhancedRecommendation[] = [];
  const currentMetrics = calculateCurrentMetrics(filteredData);

  console.log('Current metrics:', currentMetrics);
  console.log('Analysis trends:', analysis.trends);

  // Always provide performance overview
  const latestMonth = filteredData[filteredData.length - 1];
  const performanceGrade = getPerformanceGrade(currentMetrics);
  
  recommendations.push({
    type: 'opportunity',
    priority: 'medium',
    title: `Current Performance: ${performanceGrade.grade}`,
    description: `Your product generated $${currentMetrics.totalRevenue.toLocaleString()} in revenue over the selected period.`,
    dataInsight: `Average monthly revenue: $${currentMetrics.avgRevenue.toLocaleString()}, Profit margin: ${currentMetrics.profitMargin.toFixed(1)}%`,
    action: performanceGrade.action,
    expectedImpact: performanceGrade.impact,
    timeframe: 'next-month',
    icon: BarChart3,
    color: performanceGrade.color
  });

  // Month-to-month analysis (if we have multiple months)
  if (filteredData.length >= 2) {
    const sortedData = [...filteredData].sort((a, b) => a.month.localeCompare(b.month));
    const lastMonth = sortedData[sortedData.length - 1];
    const previousMonth = sortedData[sortedData.length - 2];
    
    const revenueChange = ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100);
    
    if (Math.abs(revenueChange) > 5) {
      const isPositive = revenueChange > 0;
      recommendations.push({
        type: isPositive ? 'opportunity' : 'warning',
        priority: Math.abs(revenueChange) > 20 ? 'high' : 'medium',
        title: `${isPositive ? 'Revenue Growth' : 'Revenue Decline'} Detected`,
        description: `Revenue ${isPositive ? 'increased' : 'decreased'} by ${Math.abs(revenueChange).toFixed(1)}% from ${previousMonth.month} to ${lastMonth.month}.`,
        dataInsight: `Revenue went from $${previousMonth.revenue.toLocaleString()} to $${lastMonth.revenue.toLocaleString()}`,
        action: isPositive ? 'Capitalize on momentum by scaling successful strategies' : 'Investigate causes and implement corrective measures',
        expectedImpact: isPositive ? 'Sustain growth trajectory' : 'Stabilize revenue performance',
        timeframe: 'immediate',
        icon: isPositive ? TrendingUp : AlertTriangle,
        color: isPositive ? 'green' : 'orange'
      });
    }
  }

  // Cost efficiency analysis
  if (currentMetrics.avgCPA > 0 && currentMetrics.avgSale > 0) {
    const cpaToSaleRatio = currentMetrics.avgCPA / currentMetrics.avgSale;
    
    if (cpaToSaleRatio < 0.4) {
      recommendations.push({
        type: 'opportunity',
        priority: 'high',
        title: 'Strong Cost Efficiency - Scale Opportunity',
        description: 'Your acquisition costs are very efficient relative to sale value.',
        dataInsight: `CPA is ${(cpaToSaleRatio * 100).toFixed(1)}% of average sale value ($${currentMetrics.avgCPA.toFixed(2)} vs $${currentMetrics.avgSale.toFixed(2)})`,
        action: 'Increase marketing budget by 30-50% while maintaining current targeting',
        expectedImpact: 'Potentially increase revenue by 40-60% while maintaining profitability',
        timeframe: 'immediate',
        icon: Target,
        color: 'green'
      });
    } else if (cpaToSaleRatio > 0.6) {
      recommendations.push({
        type: 'warning',
        priority: cpaToSaleRatio > 0.8 ? 'critical' : 'high',
        title: 'Cost Efficiency Needs Attention',
        description: 'Acquisition costs are high relative to sale value, impacting profitability.',
        dataInsight: `CPA represents ${(cpaToSaleRatio * 100).toFixed(1)}% of average sale value`,
        action: 'Optimize targeting, pause underperforming campaigns, or consider price adjustments',
        expectedImpact: 'Improve profit margins by 20-30%',
        timeframe: 'immediate',
        icon: AlertTriangle,
        color: 'red'
      });
    }
  }

  // Profit margin analysis
  if (currentMetrics.profitMargin < 20) {
    const priority = currentMetrics.profitMargin < 10 ? 'critical' : currentMetrics.profitMargin < 15 ? 'high' : 'medium';
    recommendations.push({
      type: 'warning',
      priority,
      title: 'Profit Margin Below Target',
      description: 'Your profit margins are below the recommended 20% threshold.',
      dataInsight: `Current profit margin is ${currentMetrics.profitMargin.toFixed(1)}%, target is 20%+`,
      action: 'Review cost structure, optimize spend allocation, or consider pricing strategy',
      expectedImpact: 'Improve sustainability and growth capacity',
      timeframe: 'next-month',
      icon: DollarSign,
      color: 'orange'
    });
  }

  // Year-over-year insights (if available)
  const yoyData = analysis.yearOverYear.filter(item => item.previousYear > 0);
  if (yoyData.length > 0) {
    const avgYoyGrowth = yoyData.reduce((sum, item) => sum + item.changePercent, 0) / yoyData.length;
    
    if (Math.abs(avgYoyGrowth) > 10) {
      const isPositive = avgYoyGrowth > 0;
      recommendations.push({
        type: isPositive ? 'opportunity' : 'warning',
        priority: Math.abs(avgYoyGrowth) > 25 ? 'high' : 'medium',
        title: `${isPositive ? 'Outperforming' : 'Underperforming'} Previous Year`,
        description: `${isPositive ? 'Strong' : 'Concerning'} year-over-year performance trend detected.`,
        dataInsight: `Average ${Math.abs(avgYoyGrowth).toFixed(1)}% ${isPositive ? 'growth' : 'decline'} vs. same period last year`,
        action: isPositive ? 'Document and replicate successful strategies' : 'Analyze last year\'s successful tactics and adapt them',
        expectedImpact: isPositive ? 'Maintain competitive advantage' : 'Recover to previous performance levels',
        timeframe: 'next-month',
        icon: BarChart3,
        color: isPositive ? 'purple' : 'orange'
      });
    }
  }

  // Seasonality recommendations
  if (analysis.seasonality.isSeasonalBusiness) {
    const currentMonth = latestMonth.month.split('-')[1];
    const isBestSeason = analysis.seasonality.bestMonths.includes(currentMonth);
    const isWorstSeason = analysis.seasonality.worstMonths.includes(currentMonth);
    
    if (isBestSeason) {
      recommendations.push({
        type: 'strategic',
        priority: 'high',
        title: 'Peak Season Opportunity',
        description: 'You\'re in one of your historically strongest performing months.',
        dataInsight: `Month ${currentMonth} is typically a top performing month for your business`,
        action: 'Maximize marketing spend and inventory to capture full seasonal potential',
        expectedImpact: 'Maximize seasonal revenue opportunity',
        timeframe: 'immediate',
        icon: Calendar,
        color: 'purple'
      });
    } else if (isWorstSeason) {
      recommendations.push({
        type: 'tactical',
        priority: 'medium',
        title: 'Off-Season Strategy',
        description: 'Currently in a historically slower performing period.',
        dataInsight: `Month ${currentMonth} is typically among your lower performing months`,
        action: 'Focus on efficiency, customer retention, and preparation for next peak season',
        expectedImpact: 'Maintain profitability during slower period',
        timeframe: 'next-month',
        icon: Lightbulb,
        color: 'blue'
      });
    }
  }

  // Future predictions
  if (predictions.confidence === 'high' || predictions.confidence === 'medium') {
    const isPositivePrediction = predictions.nextMonthRevenue > currentMetrics.avgRevenue;
    recommendations.push({
      type: 'strategic',
      priority: predictions.confidence === 'high' ? 'medium' : 'low',
      title: `${predictions.confidence === 'high' ? 'High' : 'Medium'} Confidence Prediction`,
      description: `Based on current trends, next month's performance is ${predictions.confidence === 'high' ? 'highly ' : ''}predictable.`,
      dataInsight: `Predicted next month revenue: $${predictions.nextMonthRevenue.toLocaleString()} (${predictions.confidence} confidence)`,
      action: isPositivePrediction ? 'Prepare for increased demand and scale operations' : 'Implement defensive strategies and cost controls',
      expectedImpact: 'Proactively manage expected performance changes',
      timeframe: 'next-month',
      icon: Zap,
      color: isPositivePrediction ? 'green' : 'orange'
    });
  }

  // Always provide a strategic recommendation
  if (recommendations.length < 3) {
    recommendations.push({
      type: 'strategic',
      priority: 'medium',
      title: 'Continue Performance Monitoring',
      description: 'Maintain regular analysis of your key performance metrics.',
      dataInsight: `Tracking ${filteredData.length} months of data with consistent monitoring`,
      action: 'Set up monthly performance reviews and adjust strategies based on trends',
      expectedImpact: 'Ensure sustained growth and early problem detection',
      timeframe: 'next-quarter',
      icon: Lightbulb,
      color: 'blue'
    });
  }

  // Sort by priority and return
  const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
  return recommendations
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 6);
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

const getPerformanceGrade = (metrics: ReturnType<typeof calculateCurrentMetrics>) => {
  if (metrics.profitMargin >= 35) {
    return {
      grade: 'Excellent',
      action: 'Consider scaling investment to maximize growth potential',
      impact: 'Accelerate growth while maintaining strong margins',
      color: 'green'
    };
  } else if (metrics.profitMargin >= 25) {
    return {
      grade: 'Good',
      action: 'Focus on efficiency improvements and selective scaling',
      impact: 'Optimize performance and identify growth opportunities',
      color: 'blue'
    };
  } else {
    return {
      grade: 'Poor',
      action: 'Immediate cost optimization and strategy review required',
      impact: 'Restore profitability and business sustainability',
      color: 'red'
    };
  }
};
