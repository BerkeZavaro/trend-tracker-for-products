
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ProductData {
  id: string;
  name: string;
  category: string;
  brand: string;
  month: string;
  revenue: number;
  adSpend: number;
  nonAdCosts: number;
  thirdPartyCosts: number;
  orders: number;
}

interface DataContextType {
  uploadedData: ProductData[];
  setUploadedData: (data: ProductData[]) => void;
  getUniqueProducts: () => Array<{ id: string; name: string; category: string; brand: string }>;
  getProductData: (productId: string) => ProductData[];
  isDataLoaded: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [uploadedData, setUploadedData] = useState<ProductData[]>([]);

  const getUniqueProducts = () => {
    try {
      // Add defensive programming - ensure uploadedData is always an array
      const dataArray = Array.isArray(uploadedData) ? uploadedData : [];
      
      console.log('DataContext - getUniqueProducts called, data length:', dataArray.length);
      
      if (dataArray.length === 0) {
        console.log('DataContext - No data available');
        return [];
      }

      const unique = new Map();
      dataArray.forEach((item, index) => {
        // Add validation for each item
        if (!item || typeof item !== 'object') {
          console.warn(`DataContext - Invalid item at index ${index}:`, item);
          return;
        }

        // Ensure required fields exist
        const id = item.id || `product-${index}`;
        const name = item.name || `Product ${index + 1}`;
        const category = item.category || 'Unknown';
        const brand = item.brand || 'Unknown';

        if (!unique.has(id)) {
          unique.set(id, {
            id,
            name,
            category,
            brand
          });
        }
      });

      const result = Array.from(unique.values());
      console.log('DataContext - Unique products generated:', result.length);
      return result;
    } catch (error) {
      console.error('DataContext - Error in getUniqueProducts:', error);
      return [];
    }
  };

  const getProductData = (productId: string) => {
    try {
      // Add defensive programming
      const dataArray = Array.isArray(uploadedData) ? uploadedData : [];
      const result = dataArray.filter(item => item && item.id === productId);
      console.log(`DataContext - getProductData for ${productId}:`, result.length, 'items');
      return result;
    } catch (error) {
      console.error('DataContext - Error in getProductData:', error);
      return [];
    }
  };

  const isDataLoaded = Array.isArray(uploadedData) && uploadedData.length > 0;

  // Add logging for data changes
  React.useEffect(() => {
    console.log('DataContext - Data updated, length:', uploadedData?.length || 0);
  }, [uploadedData]);

  return (
    <DataContext.Provider value={{
      uploadedData,
      setUploadedData,
      getUniqueProducts,
      getProductData,
      isDataLoaded
    }}>
      {children}
    </DataContext.Provider>
  );
};
