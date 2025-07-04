
interface TrendLegendProps {
  isRevenue: boolean;
}

const TrendLegend = ({ isRevenue }: TrendLegendProps) => {
  return (
    <div className="mt-4 text-xs text-gray-500 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isRevenue ? 'bg-green-500' : 'bg-blue-500'}`} />
        Current Year
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-1 bg-gray-400" />
        Previous Year (Comparison)
      </div>
    </div>
  );
};

export default TrendLegend;
