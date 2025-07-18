
import { useMetricsCalculations } from '@/hooks/useMetricsCalculations';
import RevenueCard from '@/components/metrics/RevenueCard';
import ProfitCard from '@/components/metrics/ProfitCard';
import OrdersCard from '@/components/metrics/OrdersCard';
import CPACard from '@/components/metrics/CPACard';

interface MetricsCardsProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

const MetricsCards = ({ productId, timeFrame }: MetricsCardsProps) => {
  const { calculateMetrics } = useMetricsCalculations(productId, timeFrame);
  const metrics = calculateMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyWithDecimals = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <RevenueCard 
        totalRevenue={metrics.totalRevenue}
        periodGrowth={metrics.periodGrowth}
        growthLabel={metrics.growthLabel}
        formatCurrency={formatCurrency}
      />
      <ProfitCard
        profit={metrics.profit}
        profitMargin={metrics.profitMargin}
        isProfitable={metrics.isProfitable}
        formatCurrency={formatCurrency}
      />
      <OrdersCard
        totalOrders={metrics.totalOrders}
        avgSale={metrics.avgSale}
        formatCurrency={formatCurrency}
      />
      <CPACard
        avgAdjustedCPA={metrics.avgAdjustedCPA}
        avgSale={metrics.avgSale}
        totalOrders={metrics.totalOrders}
        formatCurrency={formatCurrencyWithDecimals}
      />
    </div>
  );
};

export default MetricsCards;
