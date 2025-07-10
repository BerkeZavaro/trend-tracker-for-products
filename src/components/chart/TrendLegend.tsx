
interface TrendLegendProps {
  isRevenue: boolean;
}

const TrendLegend = ({ isRevenue }: TrendLegendProps) => {
  return (
    <div className="mt-4 text-xs text-gray-500 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isRevenue ? 'bg-green-500' : 'bg-blue-500'}`} />
        {isRevenue ? 'Revenue' : 'CPA'} (Current Year)
      </div>
      {!isRevenue && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-orange-500 rounded" />
          Average Sale (Current Year)
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="w-3 h-1 bg-gray-400" />
        Previous Year {isRevenue ? 'Revenue' : 'CPA'}
      </div>
      {!isRevenue && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-orange-300" style={{ borderTop: '1px dashed #fb923c' }} />
          Previous Year Avg Sale
        </div>
      )}
    </div>
  );
};

export default TrendLegend;
