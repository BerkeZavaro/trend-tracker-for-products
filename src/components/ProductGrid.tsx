
import { useState } from 'react';
import { Search, Package, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';

interface ProductGridProps {
  onProductSelect: (productId: string) => void;
  selectedProductId?: string;
}

const ProductGrid = ({ onProductSelect, selectedProductId }: ProductGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { getUniqueProducts, isDataLoaded } = useData();

  const products = isDataLoaded ? (getUniqueProducts() || []) : [];
  
  console.log('ProductGrid - products count:', products.length);

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (product: any) => {
    console.log('Product selected:', product);
    onProductSelect(product.id);
  };

  if (!isDataLoaded) {
    return (
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Select Product</label>
        <div className="w-full p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Upload Excel Data First</h3>
          <p>Upload your Excel file above to view and select products</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Select Product</label>
        <div className="w-full p-8 border border-gray-200 rounded-lg bg-blue-50 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <p className="text-blue-700">No products found in uploaded data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Select Product</label>
        <Badge variant="outline" className="text-xs">
          {filteredProducts.length} of {products.length} products
        </Badge>
      </div>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search products by name, ID, category, or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {filteredProducts.map((product) => {
          const isSelected = selectedProductId === product.id;
          
          return (
            <Card 
              key={product.id}
              className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleProductClick(product)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {product.name || 'Unnamed Product'}
                  </h4>
                  
                  <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    ID: {product.id}
                  </p>
                  
                  <div className="flex gap-1 flex-wrap">
                    {product.category && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        {product.category}
                      </Badge>
                    )}
                    {product.brand && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        {product.brand}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No products found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
