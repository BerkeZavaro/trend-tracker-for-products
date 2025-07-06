import React, { createContext, useContext, useState, ReactNode } from 'react';
import { clearSessionCache } from '@/utils/enhancedDateUtils';

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
  cpa: number;
  averageSale: number;
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

  // Enhanced setUploadedData that clears caches
  const setUploadedDataWithCacheClear = (data: ProductData[]) => {
    console.log('Setting new data and clearing caches');
    clearSessionCache();
    setUploadedData(data);
  };

  const getUniqueProducts = () => {
    try {
      const dataArray = Array.isArray(uploadedData) ? uploadedData : [];
      
      if (dataArray.length === 0) {
        return [];
      }

      const unique = new Map();
      dataArray.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
          return;
        }

        const id = item.id || `product-${index}`;
        const name = item.name || `Product ${index + 1}`;
        const category = item.category || 'Unknown';
        const brand = item.brand || 'Unknown';

        if (!unique.has(id)) {
          unique.set(id, { id, name, category, brand });
        }
      });

      return Array.from(unique.values());
    } catch (error) {
      console.error('DataContext - Error in getUniqueProducts:', error);
      return [];
    }
  };

  const getProductData = (productId: string) => {
    try {
      const dataArray = Array.isArray(uploadedData) ? uploadedData : [];
      return dataArray.filter(item => item && item.id === productId);
    } catch (error) {
      console.error('DataContext - Error in getProductData:', error);
      return [];
    }
  };

  const isDataLoaded = Array.isArray(uploadedData) && uploadedData.length > 0;

  return (
    <DataContext.Provider value={{
      uploadedData,
      setUploadedData: setUploadedDataWithCacheClear,
      getUniqueProducts,
      getProductData,
      isDataLoaded
    }}>
      {children}
    </DataContext.Provider>
  );
};
