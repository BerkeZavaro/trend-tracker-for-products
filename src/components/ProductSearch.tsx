
import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Mock product data - in real app, this would come from your API
const mockProducts = [
  { id: 'PROD001', name: 'Premium Protein Powder', category: 'Supplements', brand: 'NutriFit' },
  { id: 'PROD002', name: 'Energy Boost Capsules', category: 'Supplements', brand: 'VitalMax' },
  { id: 'PROD003', name: 'Recovery Drink Mix', category: 'Beverages', brand: 'RecoverPlus' },
  { id: 'PROD004', name: 'Joint Support Formula', category: 'Health', brand: 'FlexiCare' },
  { id: 'PROD005', name: 'Pre-Workout Blend', category: 'Supplements', brand: 'PowerUp' },
];

interface ProductSearchProps {
  onProductSelect: (productId: string) => void;
}

const ProductSearch = ({ onProductSelect }: ProductSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);

  const handleSelect = (product: typeof mockProducts[0]) => {
    setSelectedProduct(product);
    onProductSelect(product.id);
    setOpen(false);
  };

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
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search by product name or ID..." />
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {mockProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => handleSelect(product)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Package className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        {product.id} • {product.brand} • {product.category}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProductSearch;
