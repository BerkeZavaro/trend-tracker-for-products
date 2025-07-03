
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Target, DollarSign, Lightbulb, Zap } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface RecommendationsPanelProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

const RecommendationsPanel = ({ productId, timeFrame }: RecommendationsPanelProps) => {
  const { getProductData, isDataLoaded } = useData();

  // Generate recommendations based on real data
  const generateRecommendations = () => {
    if (!isDataLoaded || !productId) {
      return [];
    }

    const productData = getProductData(productId);
    
    // Filter data by time frame
    const filteredData = productData.filter(item => {
      return item.month >= timeFrame.start && item.month <= timeFrame.end;
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
      const sortedData = filteredData.sort((a, b) => a.month.localeCompare(b.month));
      const bestMonth = sortedData.reduce((best, current) => 
        current.revenue > best.revenue ? current : best
      );
      const worstMonth = sorteredData.reduce((worst, current) => 
        current.revenue < worst.revenue ? current : worst
      );

      if (bestMonth.month !== worstMonth.month) {
        recommendations.push({
          type: 'seasonal',
          priority: 'medium',
          title: 'Performance Variation Detected',
          description: `${bestMonth.month} was your best month ($${bestMonth.revenue.toLocaleString()}) vs ${worstMonth.month} ($${worstMonth.revenue.toLocaleString()}).`,
          icon: TrendingUp,
          color: 'teal',
          action: 'Analyze what worked in top-performing months'
        });
      }
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getIconColor = (color: string) => {
    const colors = {
      green: 'text-green-600',
      red: 'text-red-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      teal: 'text-teal-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Info</Badge>;
    }
  };

  // Generate real quick wins based on actual data
  const generateQuickWins = () => {
    if (!isDataLoaded || !productId) {
      return [];
    }

    const productData = getProductData(productId);
    const filteredData = productData.filter(item => {
      return item.month >= timeFrame.start && item.month <= timeFrame.end;
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
      quickWins.push(`${bestMonth.month} was your best month with $${bestMonth.revenue.toLocaleString()} revenue - analyze this period`);
    }

    // Check for consistent order volume
    const avgOrders = filteredData.reduce((sum, item) => sum + item.orders, 0) / filteredData.length;
    if (avgOrders > 0) {
      quickWins.push(`Average ${Math.round(avgOrders)} orders per month shows consistent demand`);
    }

    return quickWins.length > 0 ? quickWins : ['Continue monitoring performance for optimization opportunities'];
  };

  const quickWins = generateQuickWins();

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          Data-Driven Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600">
          Based on your product's actual performance data from {timeFrame.start} to {timeFrame.end}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-200 bg-white/50 hover:bg-white/80 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-gray-50 ${getIconColor(rec.color)}`}>
                  <rec.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Suggested action:</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      {rec.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Quick Win Opportunities</h4>
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            {quickWins.map((win, index) => (
              <li key={index}>• {win}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsPanel;
