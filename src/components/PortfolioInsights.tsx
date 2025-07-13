
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics';

interface PortfolioInsightsProps {
  timeFrame: { start: string; end: string };
}

const PortfolioInsights = ({ timeFrame }: PortfolioInsightsProps) => {
  const { calculatePortfolioMetrics, getPerformanceDistribution } = usePortfolioMetrics(timeFrame);
  const metrics = calculatePortfolioMetrics();
  const distribution = getPerformanceDistribution();

  const insights = [];

  // Portfolio Health Assessment
  const profitableRatio = distribution.total > 0 ? (distribution.profitable / distribution.total) * 100 : 0;
  
  if (profitableRatio >= 70) {
    insights.push({
      type: 'success',
      icon: <CheckCircle className="w-4 h-4" />,
      title: 'Strong Portfolio Health',
      description: `${profitableRatio.toFixed(1)}% of your products are profitable. Your portfolio is performing well.`
    });
  } else if (profitableRatio >= 50) {
    insights.push({
      type: 'warning',
      icon: <AlertTriangle className="w-4 h-4" />,
      title: 'Moderate Portfolio Health',
      description: `${profitableRatio.toFixed(1)}% of your products are profitable. Consider optimizing underperforming products.`
    });
  } else {
    insights.push({
      type: 'danger',
      icon: <AlertTriangle className="w-4 h-4" />,
      title: 'Portfolio Needs Attention',
      description: `Only ${profitableRatio.toFixed(1)}% of your products are profitable. Immediate optimization required.`
    });
  }

  // Revenue Concentration Insight
  if (metrics.revenueConcentration >= 80) {
    insights.push({
      type: 'warning',
      icon: <AlertTriangle className="w-4 h-4" />,
      title: 'High Revenue Concentration',
      description: `${metrics.revenueConcentration.toFixed(1)}% of revenue comes from top 5 products. Consider diversifying.`
    });
  }

  // Profit Margin Insight
  if (metrics.profitMargin >= 20) {
    insights.push({
      type: 'success',
      icon: <TrendingUp className="w-4 h-4" />,
      title: 'Excellent Profit Margins',
      description: `${metrics.profitMargin.toFixed(1)}% overall profit margin indicates strong pricing and cost control.`
    });
  } else if (metrics.profitMargin >= 10) {
    insights.push({
      type: 'info',
      icon: <Lightbulb className="w-4 h-4" />,
      title: 'Good Profit Margins',
      description: `${metrics.profitMargin.toFixed(1)}% profit margin is healthy. Look for opportunities to optimize further.`
    });
  } else if (metrics.profitMargin > 0) {
    insights.push({
      type: 'warning',
      icon: <AlertTriangle className="w-4 h-4" />,
      title: 'Low Profit Margins',
      description: `${metrics.profitMargin.toFixed(1)}% profit margin is concerning. Review pricing and cost structure.`
    });
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Portfolio Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Alert key={index} className={`
              ${insight.type === 'success' ? 'border-green-200 bg-green-50' : ''}
              ${insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
              ${insight.type === 'danger' ? 'border-red-200 bg-red-50' : ''}
              ${insight.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
            `}>
              <div className="flex items-start gap-3">
                <div className={`
                  ${insight.type === 'success' ? 'text-green-600' : ''}
                  ${insight.type === 'warning' ? 'text-yellow-600' : ''}
                  ${insight.type === 'danger' ? 'text-red-600' : ''}
                  ${insight.type === 'info' ? 'text-blue-600' : ''}
                `}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                  <AlertDescription className="text-gray-700">
                    {insight.description}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioInsights;
