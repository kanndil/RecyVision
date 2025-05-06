import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CameraContextType {
  capturedImage: File | null;
  setCapturedImage: (image: File | null) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [capturedImage, setCapturedImage] = useState<File | null>(null);

  return (
    <CameraContext.Provider value={{ capturedImage, setCapturedImage }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
}; 