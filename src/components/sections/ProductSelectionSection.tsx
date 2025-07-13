
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';

interface ProductSelectionSectionProps {
  selectedProduct: string;
  setSelectedProduct: (productId: string) => void;
}

const ProductSelectionSection = ({ selectedProduct, setSelectedProduct }: ProductSelectionSectionProps) => {
  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <Search className="w-5 h-5" />
          {selectedProduct ? 'Selected Product' : 'Product Selection'}
        </CardTitle>
        {selectedProduct && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedProduct('')}
            className="w-fit"
          >
            ← Back to Portfolio Overview
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ProductGrid 
          onProductSelect={setSelectedProduct}
          selectedProductId={selectedProduct}
        />
      </CardContent>
    </Card>
  );
};

export default ProductSelectionSection;
