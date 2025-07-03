
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useRecommendationsData } from '@/hooks/useRecommendationsData';
import RecommendationItem from '@/components/recommendations/RecommendationItem';
import QuickWinsSection from '@/components/recommendations/QuickWinsSection';

interface RecommendationsPanelProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

const RecommendationsPanel = ({ productId, timeFrame }: RecommendationsPanelProps) => {
  const { generateRecommendations, generateQuickWins } = useRecommendationsData(productId, timeFrame);
  const recommendations = generateRecommendations();
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
            <RecommendationItem
              key={index}
              type={rec.type}
              priority={rec.priority}
              title={rec.title}
              description={rec.description}
              icon={rec.icon}
              color={rec.color}
              action={rec.action}
            />
          ))}
        </div>

        <QuickWinsSection quickWins={quickWins} />
      </CardContent>
    </Card>
  );
};

export default RecommendationsPanel;
