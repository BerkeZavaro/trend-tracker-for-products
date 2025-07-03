
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, DollarSign, ShoppingCart, Target, RefreshCw } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import MetricsCards from '@/components/MetricsCards';
import TrendChart from '@/components/TrendChart';
import PerformanceTable from '@/components/PerformanceTable';
import RecommendationsPanel from '@/components/RecommendationsPanel';
import ExcelUpload from '@/components/ExcelUpload';
import { useData } from '@/contexts/DataContext';

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [pendingTimeFrame, setPendingTimeFrame] = useState<{ start: string; end: string }>({
    start: '2024-01',
    end: '2025-06'
  });
  const [appliedTimeFrame, setAppliedTimeFrame] = useState<{ start: string; end: string }>({
    start: '2024-01',
    end: '2025-06'
  });
  const [pendingAnalysisType, setPendingAnalysisType] = useState<'summary' | 'detailed'>('summary');
  const [appliedAnalysisType, setAppliedAnalysisType] = useState<'summary' | 'detailed'>('summary');
  const { isDataLoaded } = useData();

  const hasUnappliedChanges = 
    pendingTimeFrame.start !== appliedTimeFrame.start || 
    pendingTimeFrame.end !== appliedTimeFrame.end ||
    pendingAnalysisType !== appliedAnalysisType;

  const handleApplyAnalysis = () => {
    setAppliedTimeFrame(pendingTimeFrame);
    setAppliedAnalysisType(pendingAnalysisType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Product Performance Analyzer
              </h1>
              <p className="text-gray-600 mt-1">Analyze performance across PPC, email, and direct sales channels</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Calendar className="w-4 h-4 mr-2" />
                {appliedTimeFrame.start} to {appliedTimeFrame.end}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Excel Upload Section */}
        <ExcelUpload />

        {/* Product Selection Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Product Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductGrid 
              onProductSelect={setSelectedProduct}
              selectedProductId={selectedProduct}
            />
          </CardContent>
        </Card>

        {/* Time Frame and Analysis Type Section */}
        {selectedProduct && isDataLoaded && (
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Time Frame & Analysis Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <Input
                    type="month"
                    value={pendingTimeFrame.start}
                    onChange={(e) => setPendingTimeFrame(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <Input
                    type="month"
                    value={pendingTimeFrame.end}
                    onChange={(e) => setPendingTimeFrame(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Analysis Type</label>
                  <Select 
                    value={pendingAnalysisType} 
                    onValueChange={(value: 'summary' | 'detailed') => setPendingAnalysisType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="detailed">Detailed Breakdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Apply Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasUnappliedChanges && (
                    <Badge variant="secondary" className="text-xs">
                      Changes pending
                    </Badge>
                  )}
                </div>
                <Button 
                  onClick={handleApplyAnalysis}
                  disabled={!hasUnappliedChanges}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Apply Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedProduct && isDataLoaded && (
          <>
            {/* Key Metrics Cards */}
            <MetricsCards 
              productId={selectedProduct} 
              timeFrame={appliedTimeFrame}
            />

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <TrendChart 
                productId={selectedProduct} 
                timeFrame={appliedTimeFrame}
                metric="revenue"
              />
              <TrendChart 
                productId={selectedProduct} 
                timeFrame={appliedTimeFrame}
                metric="cpa"
              />
            </div>

            {/* Performance Table */}
            {appliedAnalysisType === 'detailed' && (
              <PerformanceTable 
                productId={selectedProduct} 
                timeFrame={appliedTimeFrame}
              />
            )}

            {/* Recommendations */}
            <RecommendationsPanel 
              productId={selectedProduct} 
              timeFrame={appliedTimeFrame}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
