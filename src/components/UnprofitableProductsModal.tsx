
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingDown, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProductAnalysis } from '@/hooks/useProductAnalysis';
import { formatCurrency } from '@/utils/performanceMetrics';

interface UnprofitableProductsModalProps {
  timeFrame: { start: string; end: string };
  unprofitableCount: number;
  children: React.ReactNode;
}

type SortField = 'name' | 'revenue' | 'profit' | 'profitMargin' | 'orders';
type SortDirection = 'asc' | 'desc';

const UnprofitableProductsModal = ({ timeFrame, unprofitableCount, children }: UnprofitableProductsModalProps) => {
  const { getUnprofitableProducts } = useProductAnalysis(timeFrame);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('profit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const unprofitableProducts = getUnprofitableProducts();

  const filteredAndSortedProducts = unprofitableProducts
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return (
      <ArrowUpDown 
        className={`w-4 h-4 ${sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-600 rotate-180'}`} 
      />
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Unprofitable Products ({unprofitableCount})
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredAndSortedProducts.length} of {unprofitableProducts.length} products
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No products match your search.' : 'No unprofitable products found.'}
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Product Name
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('revenue')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Revenue
                      {getSortIcon('revenue')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('profit')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Profit
                      {getSortIcon('profit')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('profitMargin')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Margin %
                      {getSortIcon('profitMargin')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('orders')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Orders
                      {getSortIcon('orders')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-red-50/40">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-gray-600">{product.category}</TableCell>
                    <TableCell className="text-gray-600">{product.brand}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(product.revenue)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      {formatCurrency(product.profit)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      {product.profitMargin.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {product.orders.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnprofitableProductsModal;
