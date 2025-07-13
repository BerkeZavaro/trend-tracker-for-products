
import PortfolioMetricsCards from '@/components/PortfolioMetricsCards';
import PerformanceDistributionCard from '@/components/PerformanceDistributionCard';
import PortfolioInsights from '@/components/PortfolioInsights';
import DynamicLineChart from '@/components/DynamicLineChart';
import PortfolioRankings from '@/components/PortfolioRankings';

interface PortfolioOverviewProps {
  appliedTimeFrame: { start: string; end: string };
  onProductSelect: (productId: string) => void;
}

const PortfolioOverview = ({ appliedTimeFrame, onProductSelect }: PortfolioOverviewProps) => {
  return (
    <>
      {/* Enhanced Portfolio Metrics Cards */}
      <PortfolioMetricsCards timeFrame={appliedTimeFrame} />

      {/* Performance Distribution and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceDistributionCard timeFrame={appliedTimeFrame} />
        <PortfolioInsights timeFrame={appliedTimeFrame} />
      </div>

      {/* Portfolio Performance Chart */}
      <div className="mb-8">
        <DynamicLineChart 
          timeFrame={appliedTimeFrame}
          isPortfolio={true}
          title="Portfolio Performance Overview"
        />
      </div>

      {/* Enhanced Rankings Section */}
      <PortfolioRankings 
        timeFrame={appliedTimeFrame}
        onProductSelect={onProductSelect}
      />
    </>
  );
};

export default PortfolioOverview;
