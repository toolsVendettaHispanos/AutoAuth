
'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { FullPropiedad } from '@/lib/types'
import { useProperty } from '@/contexts/property-context'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface PropertySelectorProps {
  properties: FullPropiedad[]
}

export function PropertySelector({ properties }: PropertySelectorProps) {
  const router = useRouter();
  const { selectedProperty, setSelectedPropertyById } = useProperty();

  const changeProperty = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedPropertyById(property.id);
      router.push(`/rooms/${property.ciudad}:${property.barrio}:${property.edificio}`);
    }
  }

  const handleCycleProperty = (direction: 'next' | 'prev') => {
    if (!selectedProperty || properties.length <= 1) return;

    const currentIndex = properties.findIndex(p => p.id === selectedProperty.id);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % properties.length;
    } else {
        nextIndex = (currentIndex - 1 + properties.length) % properties.length;
    }
    
    const nextProperty = properties[nextIndex];
    changeProperty(nextProperty.id);
  }

  if (!properties || properties.length === 0) {
    return null
  }
  
  if (properties.length === 1) {
    return (
       <div className="p-2">
            <Button
                variant="outline"
                role="combobox"
                className="w-full justify-start"
            >
                <Building className="mr-2 h-4 w-4" />
                <span className="truncate">{selectedProperty?.nombre || 'Propiedad'}</span>
            </Button>
       </div>
    )
  }

  return (
    <div className="p-2 flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 transition-colors" onClick={() => handleCycleProperty('prev')}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Propiedad anterior</span>
        </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full h-8 justify-center bg-muted/50 hover:bg-muted"
          >
            <div className="flex items-center gap-2 truncate">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-sm font-medium">{selectedProperty?.nombre || 'Seleccionar...'}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--sidebar-width)] -translate-x-2">
          <DropdownMenuLabel>Tus Propiedades</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {properties.map((property) => (
            <DropdownMenuItem
              key={property.id}
              onSelect={() => changeProperty(property.id)}
            >
              <Check
                className={cn('mr-2 h-4 w-4',
                  selectedProperty?.id === property.id ? 'opacity-100' : 'opacity-0'
                )}
              />
              <span>{property.nombre} [{property.ciudad}:{property.barrio}:{property.edificio}]</span>
            </DropdownMenuItem>
          ))}\
        </DropdownMenuContent>
      </DropdownMenu>
       <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 transition-colors" onClick={() => handleCycleProperty('next')}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Siguiente propiedad</span>
        </Button>
    </div>
  )
}
