'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Propiedad } from '@prisma/client';

interface PropertyContextType {
  selectedProperty: Propiedad | null;
  selectProperty: (propertyId: string) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children, properties }: { children: ReactNode, properties: Propiedad[] }) => {
  const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);

  useEffect(() => {
    if (properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0]);
    }
  }, [properties, selectedProperty]);

  const selectProperty = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId) || null;
    setSelectedProperty(property);
  };

  return (
    <PropertyContext.Provider value={{ selectedProperty, selectProperty }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};
