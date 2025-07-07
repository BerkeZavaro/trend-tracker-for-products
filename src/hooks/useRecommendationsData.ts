
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { generateEnhancedRecommendations } from '@/utils/enhancedRecommendations';

export const useRecommendationsData = (productId: string, timeFrame: { start: string; end: string }) => {
  const { getProductData, isDataLoaded, uploadedData } = useData();

  const generateRecommendations = () => {
    if (!isDataLoaded || !productId) {
      return [];
    }

    const allProductData = getProductData(productId);
    
    // Filter data by time frame using enhanced date comparison
    const filteredData = allProductData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });

    // Use the enhanced recommendations engine
    const enhancedRecommendations = generateEnhancedRecommendations(
      filteredData, 
      allProductData, 
      uploadedData, 
      timeFrame
    );

    // Convert to the expected format
    return enhancedRecommendations.map(rec => ({
      type: rec.type,
      priority: rec.priority,
      title: rec.title,
      description: rec.description,
      icon: rec.icon,
      color: rec.color,
      action: rec.action
    }));
  };

  const generateQuickWins = () => {
    if (!isDataLoaded || !productId) {
      return [];
    }

    const allProductData = getProductData(productId);
    const filteredData = allProductData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });

    if (filteredData.length === 0) {
      return ['No data available for selected time period'];
    }

    const quickWins = [];
    
    // Month-to-month improvements
    if (filteredData.length >= 2) {
      const sortedData = [...filteredData].sort((a, b) => a.month.localeCompare(b.month));
      const lastMonth = sortedData[sortedData.length - 1];
      const previousMonth = sortedData[sortedData.length - 2];
      
      if (lastMonth.revenue > previousMonth.revenue) {
        const improvement = ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1);
        quickWins.push(`Revenue grew ${improvement}% from ${previousMonth.month} to ${lastMonth.month} - momentum is building`);
      }
      
      // CPA efficiency check
      const lastCPA = lastMonth.orders > 0 ? (lastMonth.adSpend + lastMonth.nonAdCosts + lastMonth.thirdPartyCosts) / lastMonth.orders : 0;
      const prevCPA = previousMonth.orders > 0 ? (previousMonth.adSpend + previousMonth.nonAdCosts + previousMonth.thirdPartyCosts) / previousMonth.orders : 0;
      
      if (lastCPA < prevCPA && lastCPA > 0) {
        const improvement = ((prevCPA - lastCPA) / prevCPA * 100).toFixed(1);
        quickWins.push(`Cost per acquisition improved ${improvement}% - efficiency is increasing`);
      }
    }

    // Year-over-year comparison
    const currentYear = new Date().getFullYear();
    const currentYearData = filteredData.filter(item => item.month.startsWith(currentYear.toString()));
    const lastYearData = allProductData.filter(item => item.month.startsWith((currentYear - 1).toString()));
    
    if (currentYearData.length > 0 && lastYearData.length > 0) {
      const currentAvg = currentYearData.reduce((sum, item) => sum + item.revenue, 0) / currentYearData.length;
      const lastYearAvg = lastYearData.reduce((sum, item) => sum + item.revenue, 0) / lastYearData.length;
      
      if (currentAvg > lastYearAvg) {
        const improvement = ((currentAvg - lastYearAvg) / lastYearAvg * 100).toFixed(1);
        quickWins.push(`Outperforming last year by ${improvement}% on average - strong year-over-year growth`);
      }
    }

    // Profit margin health check
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
    const totalCosts = filteredData.reduce((sum, item) => sum + item.adSpend + item.nonAdCosts + item.thirdPartyCosts, 0);
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    
    if (profitMargin > 25) {
      quickWins.push(`Strong ${profitMargin.toFixed(1)}% profit margin provides room for strategic investments`);
    } else if (profitMargin > 15) {
      quickWins.push(`Healthy ${profitMargin.toFixed(1)}% profit margin - focus on maintaining efficiency`);
    }

    return quickWins.length > 0 ? quickWins : ['Continue monitoring performance for optimization opportunities'];
  };

  return {
    generateRecommendations,
    generateQuickWins
  };
};
