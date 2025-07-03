
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Target, DollarSign, Lightbulb, Zap } from 'lucide-react';

interface RecommendationsPanelProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

// Analyze performance and generate recommendations
const generateRecommendations = (productId: string) => {
  // Mock analysis - in real app, this would analyze actual data
  const mockAnalysis = {
    currentCPA: 72.50,
    avgSale: 100.95,
    profitMargin: 28.8,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    worstMonth: 'January 2024',
    bestMonth: 'March 2024',
    seasonalTrend: 'increasing',
    channelPerformance: {
      google: { cpa: 68.20, orders: 450, performance: 'excellent' },
      facebook: { cpa: 78.90, orders: 320, performance: 'good' },
      amazon: { cpa: 85.40, orders: 280, performance: 'average' },
      email: { cpa: 45.20, orders: 197, performance: 'excellent' }
    }
  };

  const recommendations = [];

  // CPA Analysis
  if (mockAnalysis.currentCPA < mockAnalysis.avgSale * 0.7) {
    recommendations.push({
      type: 'scale',
      priority: 'high',
      title: 'Scale Advertising Spend',
      description: 'Your CPA is well below average sale value. Consider increasing ad spend to capture more profitable orders.',
      icon: TrendingUp,
      color: 'green',
      action: 'Increase budget by 25-30%'
    });
  } else if (mockAnalysis.currentCPA > mockAnalysis.avgSale * 0.85) {
    recommendations.push({
      type: 'optimize',
      priority: 'high',
      title: 'Optimize Ad Performance',
      description: 'CPA is too high relative to average sale value. Focus on improving conversion rates or reducing costs.',
      icon: Target,
      color: 'red',
      action: 'Review targeting and bidding strategy'
    });
  }

  // Channel Performance
  const bestChannel = Object.entries(mockAnalysis.channelPerformance)
    .sort(([,a], [,b]) => a.cpa - b.cpa)[0];
  
  recommendations.push({
    type: 'channel',
    priority: 'medium',
    title: `Focus on ${bestChannel[0].charAt(0).toUpperCase() + bestChannel[0].slice(1)}`,
    description: `${bestChannel[0]} is your best performing channel with lowest CPA. Consider reallocating budget here.`,
    icon: Zap,
    color: 'blue',
    action: `Shift 15% more budget to ${bestChannel[0]}`
  });

  // Profit Margin Analysis
  if (mockAnalysis.profitMargin > 25) {
    recommendations.push({
      type: 'growth',
      priority: 'medium',
      title: 'Strong Margins - Test New Channels',
      description: 'Healthy profit margins provide room for testing new advertising channels or markets.',
      icon: Lightbulb,
      color: 'purple',
      action: 'Test Reddit or TikTok advertising'
    });
  } else if (mockAnalysis.profitMargin < 15) {
    recommendations.push({
      type: 'margins',
      priority: 'high',
      title: 'Review Cost Structure',
      description: 'Profit margins are concerning. Review product costs, shipping, and operational expenses.',
      icon: AlertTriangle,
      color: 'orange',
      action: 'Audit all costs and pricing strategy'
    });
  }

  // Seasonal Trends
  recommendations.push({
    type: 'seasonal',
    priority: 'low',
    title: 'Seasonal Trend Detected',
    description: `Performance typically ${mockAnalysis.seasonalTrend} during this period. Plan inventory and budget accordingly.`,
    icon: TrendingUp,
    color: 'teal',
    action: 'Adjust Q3 budget planning'
  });

  return recommendations;
};

const RecommendationsPanel = ({ productId, timeFrame }: RecommendationsPanelProps) => {
  const recommendations = generateRecommendations(productId);

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

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          AI-Powered Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600">
          Based on your product's performance data and market trends
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
            <li>• Email marketing shows lowest CPA - increase email campaigns</li>
            <li>• March consistently outperforms - replicate March strategies</li>
            <li>• Mobile conversion rate could be improved - test mobile-optimized landing pages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsPanel;
