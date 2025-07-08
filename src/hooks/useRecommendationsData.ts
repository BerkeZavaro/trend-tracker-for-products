
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { generateEnhancedRecommendations } from '@/utils/enhancedRecommendations';

export const useRecommendationsData = (productId: string, timeFrame: { start: string; end: string }) => {
  const { getProductData, isDataLoaded, uploadedData } = useData();

  const generateRecommendations = () => {
    if (!isDataLoaded || !productId) {
      console.log('No data loaded or no product selected');
      return [];
    }

    const allProductData = getProductData(productId);
    console.log('All product data:', allProductData.length, 'items');
    
    // Filter data by time frame using enhanced date comparison
    const filteredData = allProductData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });

    console.log('Filtered data for timeframe:', filteredData.length, 'items');
    console.log('Timeframe:', timeFrame);

    // Use the enhanced recommendations engine
    const enhancedRecommendations = generateEnhancedRecommendations(
      filteredData, 
      allProductData, 
      uploadedData, 
      timeFrame
    );

    console.log('Generated recommendations:', enhancedRecommendations.length);

    // Convert to the expected format with all required properties
    return enhancedRecommendations.map(rec => ({
      type: rec.type,
      priority: rec.priority,
      title: rec.title,
      description: rec.description,
      icon: rec.icon,
      color: rec.color,
      action: rec.action,
      dataInsight: rec.dataInsight,
      expectedImpact: rec.expectedImpact,
      timeframe: rec.timeframe
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
    
    // Sort by date to get the actual last month
    const sortedData = [...filteredData].sort((a, b) => a.month.localeCompare(b.month));
    const lastMonth = sortedData[sortedData.length - 1];
    const previousMonth = sortedData.length > 1 ? sortedData[sortedData.length - 2] : null;
    
    // Last month revenue performance
    if (previousMonth && lastMonth.revenue > previousMonth.revenue) {
      const improvement = ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1);
      quickWins.push(`Last month (${lastMonth.month}) revenue grew ${improvement}% to $${lastMonth.revenue.toLocaleString()}`);
    }
    
    // Last month Adjusted CPA efficiency
    if (previousMonth && lastMonth.adjustedCpa > 0 && previousMonth.adjustedCpa > 0) {
      if (lastMonth.adjustedCpa < previousMonth.adjustedCpa) {
        const improvement = ((previousMonth.adjustedCpa - lastMonth.adjustedCpa) / previousMonth.adjustedCpa * 100).toFixed(1);
        quickWins.push(`Last month Adjusted CPA improved ${improvement}% to $${lastMonth.adjustedCpa.toFixed(2)} per order`);
      }
    }

    // Last month profit margin
    const lastMonthCosts = lastMonth.adSpend + lastMonth.nonAdCosts + lastMonth.thirdPartyCosts;
    const lastMonthProfit = lastMonth.revenue - lastMonthCosts;
    const lastMonthProfitMargin = lastMonth.revenue > 0 ? (lastMonthProfit / lastMonth.revenue) * 100 : 0;
    
    if (lastMonthProfitMargin > 20) {
      quickWins.push(`Last month achieved strong ${lastMonthProfitMargin.toFixed(1)}% profit margin ($${lastMonthProfit.toLocaleString()} profit)`);
    }

    // Year-over-year comparison for last month
    const [year, month] = lastMonth.month.split('-');
    const lastYearSameMonth = allProductData.find(item => item.month === `${parseInt(year) - 1}-${month}`);
    
    if (lastYearSameMonth && lastMonth.revenue > lastYearSameMonth.revenue) {
      const yoyGrowth = ((lastMonth.revenue - lastYearSameMonth.revenue) / lastYearSameMonth.revenue * 100).toFixed(1);
      quickWins.push(`Last month outperformed same month last year by ${yoyGrowth}% ($${lastMonth.revenue.toLocaleString()} vs $${lastYearSameMonth.revenue.toLocaleString()})`);
    }

    return quickWins.length > 0 ? quickWins : ['Last month data available - focus on optimizing recent performance trends'];
  };

  return {
    generateRecommendations,
    generateQuickWins
  };
};
