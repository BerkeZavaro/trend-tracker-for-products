
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/dateUtils';
import { generateEnhancedRecommendations } from '@/utils/enhancedRecommendations';
import { smartNormalizeDate } from '@/utils/enhancedDateUtils';

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
    console.log('=== Quick Wins Generation Debug ===');
    
    if (!isDataLoaded || !productId) {
      console.log('No data loaded or no product selected');
      return [];
    }

    const allProductData = getProductData(productId);
    console.log('All product data for quick wins:', allProductData.length, 'items');
    
    const filteredData = allProductData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });

    console.log('Filtered data for quick wins:', filteredData.length, 'items');

    if (filteredData.length === 0) {
      return ['No data available for selected time period'];
    }

    const quickWins = [];
    
    // Find the actual last month from ALL DATA, not just filtered data
    const normalizedAllData = allProductData.map(item => ({
      ...item,
      normalizedMonth: smartNormalizeDate(item.month, allProductData)
    }));
    
    const sortedAllData = [...normalizedAllData].sort((a, b) => 
      a.normalizedMonth.localeCompare(b.normalizedMonth)
    );
    
    const actualLastMonth = sortedAllData[sortedAllData.length - 1];
    const actualPreviousMonth = sortedAllData.length > 1 ? sortedAllData[sortedAllData.length - 2] : null;
    
    console.log('Actual last month for quick wins:', actualLastMonth.month, '(normalized:', actualLastMonth.normalizedMonth, ')');
    console.log('Actual previous month for quick wins:', actualPreviousMonth?.month);
    
    // Check if the actual last month is within our filtered timeframe
    const lastMonthInFilteredData = filteredData.find(item => item.month === actualLastMonth.month);
    
    let lastMonth, previousMonth;
    
    if (lastMonthInFilteredData) {
      console.log('Using actual last month for quick wins (within timeframe)');
      lastMonth = actualLastMonth;
      previousMonth = actualPreviousMonth;
    } else {
      console.log('Actual last month outside timeframe, using filtered data last month for quick wins');
      // Use last month from filtered data if actual last month is outside timeframe
      const normalizedFilteredData = filteredData.map(item => ({
        ...item,
        normalizedMonth: smartNormalizeDate(item.month, allProductData)
      }));
      
      const sortedFilteredData = [...normalizedFilteredData].sort((a, b) => 
        a.normalizedMonth.localeCompare(b.normalizedMonth)
      );
      
      lastMonth = sortedFilteredData[sortedFilteredData.length - 1];
      previousMonth = sortedFilteredData.length > 1 ? sortedFilteredData[sortedFilteredData.length - 2] : null;
      
      console.log('Using filtered last month for quick wins:', lastMonth.month);
    }
    
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
    const normalizedLastMonth = smartNormalizeDate(lastMonth.month, allProductData);
    const [year, month] = normalizedLastMonth.split('-');
    const lastYearSameMonth = allProductData.find(item => {
      const normalizedItemMonth = smartNormalizeDate(item.month, allProductData);
      return normalizedItemMonth === `${parseInt(year) - 1}-${month}`;
    });
    
    if (lastYearSameMonth && lastMonth.revenue > lastYearSameMonth.revenue) {
      const yoyGrowth = ((lastMonth.revenue - lastYearSameMonth.revenue) / lastYearSameMonth.revenue * 100).toFixed(1);
      quickWins.push(`Last month outperformed same month last year by ${yoyGrowth}% ($${lastMonth.revenue.toLocaleString()} vs $${lastYearSameMonth.revenue.toLocaleString()})`);
    }

    // Add note if using timeframe-limited data
    if (!lastMonthInFilteredData) {
      quickWins.push(`Note: Analysis based on timeframe data (${timeFrame.start} to ${timeFrame.end}). Dataset's actual last month (${actualLastMonth.month}) is outside selected range.`);
    }

    return quickWins.length > 0 ? quickWins : ['Last month data available - focus on optimizing recent performance trends'];
  };

  return {
    generateRecommendations,
    generateQuickWins
  };
};
