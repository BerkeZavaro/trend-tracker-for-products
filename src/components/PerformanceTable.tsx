
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/enhancedDateUtils';
import { processPerformanceData } from '@/utils/performanceMetrics';
import PerformanceTableRow from './performance/PerformanceTableRow';

interface PerformanceTableProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

const PerformanceTable = ({ productId, timeFrame }: PerformanceTableProps) => {
  const { getProductData, isDataLoaded, uploadedData } = useData();

  const getRealData = () => {
    if (!isDataLoaded || !productId) {
      return { filteredData: [], allData: [] };
    }

    const productData = getProductData(productId);
    
    // Filter data by time frame using enhanced date comparison
    const filteredData = productData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });

    // Process the filtered data to calculate derived metrics
    const processedFilteredData = processPerformanceData(filteredData);
    
    // Process all product data (needed for YoY comparisons) 
    const processedAllData = processPerformanceData(productData);

    return { 
      filteredData: processedFilteredData, 
      allData: processedAllData 
    };
  };

  const { filteredData, allData } = getRealData();

  if (!isDataLoaded) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Monthly Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Please upload Excel data to view performance metrics.</p>
        </CardContent>
      </Card>
    );
  }

  if (filteredData.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Monthly Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data available for the selected product and time period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-8">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Monthly Performance Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Month</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Ad Spend</TableHead>
                <TableHead className="text-right">Total Costs</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">CPA</TableHead>
                <TableHead className="text-right">Adjusted CPA</TableHead>
                <TableHead className="text-right">Avg Sale</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => {
                const previousRow = index > 0 ? filteredData[index - 1] : null;
                
                return (
                  <PerformanceTableRow
                    key={index}
                    row={row}
                    previousRow={previousRow}
                    index={index}
                    allProductData={allData}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTable;
