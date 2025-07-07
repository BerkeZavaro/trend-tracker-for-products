
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
    <span className={`text-[10px] ${colorClass} ml-1`}>
      {arrow}{isPositive ? '+' : '-'}{formattedPercentage}
    </span>
  );
};

export default ChangeIndicator;
