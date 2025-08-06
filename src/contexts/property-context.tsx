'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { FullPropiedad } from '@/lib/types';

interface PropertyContextType {
  selectedProperty: FullPropiedad | null;
  setSelectedPropertyById: (propertyId: string) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children, properties }: { children: ReactNode, properties: FullPropiedad[] }) => {
  const [selectedProperty, setSelectedProperty] = useState<FullPropiedad | null>(null);

  useEffect(() => {
    // Initialize with the first property if none is selected
    if (properties && properties.length > 0 && !selectedProperty) {
      // Find 'Propiedad Principal' or default to the first one
      const mainProperty = properties.find(p => p.nombre === 'Propiedad Principal') || properties[0];
      setSelectedProperty(mainProperty);
    }
  }, [properties, selectedProperty]);

  const setSelectedPropertyById = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId) || null;
    setSelectedProperty(property);
  };

  return (
    <PropertyContext.Provider value={{ selectedProperty, setSelectedPropertyById }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};
