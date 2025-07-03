
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
    const unique = new Map();
    uploadedData.forEach(item => {
      if (!unique.has(item.id)) {
        unique.set(item.id, {
          id: item.id,
          name: item.name,
          category: item.category,
          brand: item.brand
        });
      }
    });
    return Array.from(unique.values());
  };

  const getProductData = (productId: string) => {
    return uploadedData.filter(item => item.id === productId);
  };

  const isDataLoaded = uploadedData.length > 0;

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
