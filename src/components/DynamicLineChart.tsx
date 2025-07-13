
import ProductChart from '@/components/chart/ProductChart';
import PortfolioChart from '@/components/chart/PortfolioChart';

interface DynamicLineChartProps {
  productId?: string;
  timeFrame: { start: string; end: string };
  isPortfolio?: boolean;
  title?: string;
}

const DynamicLineChart = ({ productId, timeFrame, isPortfolio = false, title }: DynamicLineChartProps) => {
  if (isPortfolio) {
    return (
      <PortfolioChart 
        timeFrame={timeFrame}
        title={title}
      />
    );
  }

  if (productId) {
    return (
      <ProductChart 
        productId={productId}
        timeFrame={timeFrame}
        title={title}
      />
    );
  }

  return null;
};

export default DynamicLineChart;
