
interface ChangeIndicatorProps {
  percentageChange: number;
}

const ChangeIndicator = ({ percentageChange }: ChangeIndicatorProps) => {
  if (Math.abs(percentageChange) < 0.1) return null;

  const isPositive = percentageChange > 0;
  const arrow = isPositive ? '↑' : '↓';
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  
  const formattedPercentage = `${Math.abs(percentageChange).toFixed(1)}%`;

  return (
    <div className={`text-xs ${colorClass} mt-0.5`}>
      {arrow} {isPositive ? '+' : '-'}{formattedPercentage}
    </div>
  );
};

export default ChangeIndicator;
