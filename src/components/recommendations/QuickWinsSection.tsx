
import { CheckCircle } from 'lucide-react';

interface QuickWinsSectionProps {
  quickWins: string[];
}

const QuickWinsSection = ({ quickWins }: QuickWinsSectionProps) => {
  return (
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
  );
};

export default QuickWinsSection;
