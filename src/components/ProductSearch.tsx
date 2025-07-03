
import { useState } from 'react';
import { Search, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useData } from '@/contexts/DataContext';

interface ProductSearchProps {
  onProductSelect: (productId: string) => void;
}

const ProductSearch = ({ onProductSelect }: ProductSearchProps) => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { getUniqueProducts, isDataLoaded } = useData();

  // Add defensive programming - always ensure products is an array
  const products = isDataLoaded ? (getUniqueProducts() || []) : [];
  
  // Add debug logging
  console.log('ProductSearch - isDataLoaded:', isDataLoaded);
  console.log('ProductSearch - products count:', products.length);
  console.log('ProductSearch - products sample:', products[0]);

  const handleSelect = (product: any) => {
    console.log('Product selected:', product);
    setSelectedProduct(product);
    onProductSelect(product.id);
    setOpen(false);
  };

  if (!isDataLoaded) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Product</label>
        <div className="w-full p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-center">
          Upload Excel data first to select products
        </div>
      </div>
    );
  }

  // Show loading state if data is loaded but no products yet
  if (isDataLoaded && products.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Product</label>
        <div className="w-full p-3 border border-gray-200 rounded-md bg-blue-50 text-blue-600 text-center flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing products...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Select Product</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            {selectedProduct ? (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium text-sm">{selectedProduct.name}</div>
                  <div className="text-xs text-gray-500">{selectedProduct.id}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Search className="w-4 h-4" />
                Search products...
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-white z-50" align="start">
          {/* Add error boundary and defensive rendering */}
          {products && products.length > 0 ? (
            <Command>
              <CommandInput placeholder="Search by product name or ID..." />
              <CommandEmpty>No products found.</CommandEmpty>
              <CommandGroup>
                {products.map((product) => {
                  // Add safety check for each product
                  if (!product || !product.id) {
                    console.warn('Invalid product data:', product);
                    return null;
                  }
                  
                  return (
                    <CommandItem
                      key={product.id}
                      onSelect={() => handleSelect(product)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Package className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{product.name || 'Unnamed Product'}</div>
                          <div className="text-xs text-gray-500">
                            {product.id} • {product.brand || 'No Brand'} • {product.category || 'No Category'}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No products available</p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProductSearch;
