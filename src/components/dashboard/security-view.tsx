
'use client'

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { UserWithProgress, FullConfiguracionTropa } from "@/lib/types";
import { useProperty } from "@/contexts/property-context";
import { SecuritySummary } from "./security/security-summary";
import { SecurityTroopManager } from "./security/security-troop-manager";

type TroopWithStats = FullConfiguracionTropa & {
    ataqueActual: number;
    defensaActual: number;
    capacidadActual: number;
    velocidadActual: number;
    salarioActual: number;
}

type SecurityViewProps = {
    defenseTroops: TroopWithStats[];
    user: UserWithProgress;
}

export function SecurityView({ defenseTroops }: SecurityViewProps) {
  const { selectedProperty } = useProperty();

  const troopsData = useMemo(() => {
    if (!selectedProperty) return { disponibles: [], asignadas: [] };

    const tropasDisponibles = new Map(selectedProperty.TropaUsuario.map(t => [t.configuracionTropaId, t.cantidad]));
    const tropasAsignadas = new Map(selectedProperty.TropaSeguridadUsuario.map(t => [t.configuracionTropaId, t.cantidad]));

    return {
        disponibles: defenseTroops.map(config => ({
            ...config,
            cantidad: tropasDisponibles.get(config.id) || 0,
        })).filter(t => t.cantidad > 0),
        asignadas: defenseTroops.map(config => ({
            ...config,
            cantidad: tropasAsignadas.get(config.id) || 0,
        })).filter(t => t.cantidad > 0)
    };
  }, [selectedProperty, defenseTroops]);

  if (!selectedProperty) {
    return (
      <div className="main-view">
        <h2 className="text-3xl font-bold tracking-tight">Seguridad</h2>
        <Card>
          <CardContent className="p-6">
              <p>Por favor, selecciona una propiedad para gestionar sus defensas.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const allAssignedTroops = selectedProperty.TropaSeguridadUsuario;
  const totalDefensePower = allAssignedTroops.reduce((acc, tropa) => {
    const config = defenseTroops.find(c => c.id === tropa.configuracionTropaId);
    return acc + ((config?.defensaActual || 0) * tropa.cantidad);
  }, 0);
  
  const totalMunitionConsumption = allAssignedTroops.reduce((acc, tropa) => {
      const config = defenseTroops.find(c => c.id === tropa.configuracionTropaId);
      return acc + ((config?.salario || 0) * tropa.cantidad)
  }, 0)

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Centro de Mando Defensivo</h2>
                <p className="text-muted-foreground">
                    Gestiona las unidades defensivas de: {selectedProperty.nombre}.
                </p>
            </div>
       </div>
       <SecuritySummary 
            totalDefensePower={totalDefensePower}
            munitionConsumption={totalMunitionConsumption}
        />
       <SecurityTroopManager
            propertyId={selectedProperty.id}
            availableTroops={troopsData.disponibles}
            assignedTroops={troopsData.asignadas}
       />
    </div>
  )
}
