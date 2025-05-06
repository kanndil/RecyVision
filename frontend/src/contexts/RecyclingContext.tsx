import React, { createContext, useContext, useState } from 'react';

interface RecyclingItem {
  type: string;
  confidence: number;
  timestamp: string;
  model: 'custom' | 'gemini';
}

interface RecyclingContextType {
  recyclingItems: RecyclingItem[];
  addRecyclingItem: (item: RecyclingItem) => void;
}

const RecyclingContext = createContext<RecyclingContextType | undefined>(undefined);

export const RecyclingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recyclingItems, setRecyclingItems] = useState<RecyclingItem[]>([]);

  const addRecyclingItem = (item: RecyclingItem) => {
    setRecyclingItems(prev => [...prev, item]);
  };

  return (
    <RecyclingContext.Provider value={{ recyclingItems, addRecyclingItem }}>
      {children}
    </RecyclingContext.Provider>
  );
};

export const useRecycling = () => {
  const context = useContext(RecyclingContext);
  if (context === undefined) {
    throw new Error('useRecycling must be used within a RecyclingProvider');
  }
  return context;
}; 