import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { AlertTriangle, TrendingUp, Target, Lightbulb } from 'lucide-react';

export const useRecommendationsData = (productId: string, timeFrame: { start: string; end: string }) => {
  const { getProductData, isDataLoaded, uploadedData } = useData();

  const generateRecommendations = () => {
    if (!isDataLoaded || !productId) {
      return [];
    }

    const productData = getProductData(productId);
    
    // Filter data by time frame using enhanced date comparison
    const filteredData = productData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });

    if (filteredData.length === 0) {
      return [{
        type: 'info',
        priority: 'medium',
        title: 'No Data Available',
        description: 'No data found for the selected time period. Try adjusting your date range.',
        icon: AlertTriangle,
        color: 'orange',
        action: 'Select a different date range'
      }];
    }

    const recommendations = [];

    // Calculate actual metrics
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
    const totalAdSpend = filteredData.reduce((sum, item) => sum + item.adSpend, 0);
    const totalOrders = filteredData.reduce((sum, item) => sum + item.orders, 0);
    const totalCosts = filteredData.reduce((sum, item) => sum + item.adSpend + item.nonAdCosts + item.thirdPartyCosts, 0);
    
    const avgCPA = totalOrders > 0 ? totalAdSpend / totalOrders : 0;
    const avgSale = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

    // CPA Analysis
    if (avgCPA > 0 && avgSale > 0) {
      if (avgCPA < avgSale * 0.7) {
        recommendations.push({
          type: 'scale',
          priority: 'high',
          title: 'Scale Advertising Spend',
          description: `Your CPA ($${avgCPA.toFixed(2)}) is well below average sale value ($${avgSale.toFixed(2)}). Consider increasing ad spend.`,
          icon: TrendingUp,
          color: 'green',
          action: 'Increase budget by 25-30%'
        });
      } else if (avgCPA > avgSale * 0.85) {
        recommendations.push({
          type: 'optimize',
          priority: 'high',
          title: 'Optimize Ad Performance',
          description: `CPA ($${avgCPA.toFixed(2)}) is too high relative to average sale value ($${avgSale.toFixed(2)}).`,
          icon: Target,
          color: 'red',
          action: 'Review targeting and bidding strategy'
        });
      }
    }

    // Profit Margin Analysis
    if (profitMargin > 25) {
      recommendations.push({
        type: 'growth',
        priority: 'medium',
        title: 'Strong Margins - Consider Growth',
        description: `Healthy profit margin (${profitMargin.toFixed(1)}%) provides room for testing new strategies.`,
        icon: Lightbulb,
        color: 'purple',
        action: 'Test new advertising channels'
      });
    } else if (profitMargin < 15 && profitMargin > -100) {
      recommendations.push({
        type: 'margins',
        priority: 'high',
        title: 'Review Cost Structure',
        description: `Profit margin (${profitMargin.toFixed(1)}%) needs improvement. Review costs and pricing.`,
        icon: AlertTriangle,
        color: 'orange',
        action: 'Audit all costs and pricing strategy'
      });
    }

    // Monthly Performance Analysis
    if (filteredData.length >= 2) {
      const sortedData = filteredData.sort((a, b) => {
        const aDate = isDateInRange(a.month, '2024-01', '2025-12', uploadedData) ? a.month : '2024-01';
        const bDate = isDateInRange(b.month, '2024-01', '2025-12', uploadedData) ? b.month : '2024-01';
        return aDate.localeCompare(bDate);
      });
      const bestMonth = sortedData.reduce((best, current) => 
        current.revenue > best.revenue ? current : best
      );
      const worstMonth = sortedData.reduce((worst, current) => 
        current.revenue < worst.revenue ? current : worst
      );

      if (bestMonth.month !== worstMonth.month) {
        recommendations.push({
          type: 'seasonal',
          priority: 'medium',
          title: 'Performance Variation Detected',
          description: `Month ${bestMonth.month} was your best ($${bestMonth.revenue.toLocaleString()}) vs Month ${worstMonth.month} ($${worstMonth.revenue.toLocaleString()}).`,
          icon: TrendingUp,
          color: 'teal',
          action: 'Analyze what worked in top-performing months'
        });
      }
    }

    return recommendations;
  };

  const generateQuickWins = () => {
    if (!isDataLoaded || !productId) {
      return [];
    }

    const productData = getProductData(productId);
    const filteredData = productData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });

    if (filteredData.length === 0) {
      return ['No data available for selected time period'];
    }

    const quickWins = [];
    const avgThirdPartyCosts = filteredData.reduce((sum, item) => sum + item.thirdPartyCosts, 0) / filteredData.length;
    const avgAdSpend = filteredData.reduce((sum, item) => sum + item.adSpend, 0) / filteredData.length;
    
    if (avgThirdPartyCosts < avgAdSpend * 0.3) {
      quickWins.push(`Third-party costs are relatively low (avg $${avgThirdPartyCosts.toFixed(0)}) - good cost management`);
    }

    // Find best performing month
    if (filteredData.length > 1) {
      const bestMonth = filteredData.reduce((best, current) => 
        current.revenue > best.revenue ? current : best
      );
      quickWins.push(`Month ${bestMonth.month} was your best with $${bestMonth.revenue.toLocaleString()} revenue - analyze this period`);
    }

    // Check for consistent order volume
    const avgOrders = filteredData.reduce((sum, item) => sum + item.orders, 0) / filteredData.length;
    if (avgOrders > 0) {
      quickWins.push(`Average ${Math.round(avgOrders)} orders per month shows consistent demand`);
    }

    return quickWins.length > 0 ? quickWins : ['Continue monitoring performance for optimization opportunities'];
  };

  return {
    generateRecommendations,
    generateQuickWins
  };
};
