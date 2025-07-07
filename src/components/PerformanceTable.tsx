import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { isDateInRange } from '@/utils/enhancedDateUtils';
import { processPerformanceData } from '@/utils/performanceMetrics';
import PerformanceTableRow from './performance/PerformanceTableRow';
import { useEffect, useRef, useState } from 'react';

interface PerformanceTableProps {
  productId: string;
  timeFrame: { start: string; end: string };
}

const PerformanceTable = ({ productId, timeFrame }: PerformanceTableProps) => {
  const { getProductData, isDataLoaded, uploadedData } = useData();
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  const getRealData = () => {
    if (!isDataLoaded || !productId) {
      return [];
    }

    const productData = getProductData(productId);
    
    // Filter data by time frame using enhanced date comparison
    const filteredData = productData.filter(item => {
      return isDateInRange(item.month, timeFrame.start, timeFrame.end, uploadedData);
    });

    // Process the real data to calculate derived metrics
    return processPerformanceData(filteredData);
  };

  const data = getRealData();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyHeader(!entry.isIntersecting);
      },
      {
        rootMargin: '-1px 0px 0px 0px',
        threshold: 0
      }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, [data.length]);

  useEffect(() => {
    const measureColumnWidths = () => {
      if (headerRef.current) {
        const cells = headerRef.current.querySelectorAll('th');
        const widths = Array.from(cells).map(cell => cell.offsetWidth);
        setColumnWidths(widths);
      }
    };

    measureColumnWidths();
    window.addEventListener('resize', measureColumnWidths);
    
    return () => {
      window.removeEventListener('resize', measureColumnWidths);
    };
  }, [data.length]);

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

  if (data.length === 0) {
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

  const headerCells = [
    { text: 'Month', className: 'w-24' },
    { text: 'Revenue', className: 'text-right' },
    { text: 'Ad Spend', className: 'text-right' },
    { text: 'Total Costs', className: 'text-right' },
    { text: 'Profit', className: 'text-right' },
    { text: 'Margin', className: 'text-right' },
    { text: 'Orders', className: 'text-right' },
    { text: 'CPA', className: 'text-right' },
    { text: 'Adjusted CPA', className: 'text-right' },
    { text: 'Avg Sale', className: 'text-right' },
    { text: 'Status', className: 'text-center' },
    { text: 'Trend', className: 'text-center' }
  ];

  return (
    <>
      {showStickyHeader && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b transition-opacity duration-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="py-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Monthly Performance Breakdown</div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {headerCells.map((header, index) => (
                        <th
                          key={header.text}
                          className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${header.className}`}
                          style={{ width: columnWidths[index] || 'auto' }}
                        >
                          {header.text}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Monthly Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader ref={headerRef}>
                <TableRow>
                  {headerCells.map((header) => (
                    <TableHead key={header.text} className={header.className}>
                      {header.text}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => {
                  const previousRow = index > 0 ? data[index - 1] : null;
                  
                  return (
                    <PerformanceTableRow
                      key={index}
                      row={row}
                      previousRow={previousRow}
                      index={index}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PerformanceTable;
