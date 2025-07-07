
interface YoYIndicatorProps {
  percentageChange: number;
  comparedToMonth?: string;
}

const YoYIndicator = ({ percentageChange, comparedToMonth }: YoYIndicatorProps) => {
  console.log('YoYIndicator - percentageChange:', percentageChange, 'comparedToMonth:', comparedToMonth);
  
  if (Math.abs(percentageChange) < 0.1) {
    console.log('YoYIndicator - percentage change too small, not showing');
    return null;
  }

  const isPositive = percentageChange > 0;
  const arrow = isPositive ? '↑' : '↓';
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  
  const formattedPercentage = `${Math.abs(percentageChange).toFixed(1)}%`;

  console.log('YoYIndicator - rendering with:', { arrow, formattedPercentage, colorClass });

  return (
    <div className={`text-xs ${colorClass} mt-0.5 opacity-75`}>
      {arrow} {isPositive ? '+' : '-'}{formattedPercentage} vs LY
    </div>
  );
};

export default YoYIndicator;
