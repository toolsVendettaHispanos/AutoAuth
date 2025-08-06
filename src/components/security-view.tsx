
'use client'

import Image from "next/image"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, PlusCircle, Ban, Loader2, Info, Dumbbell, ShieldCheck, DollarSign, Minus, Plus } from "lucide-react"
import { iniciarEntrenamientoSeguridad } from "@/lib/actions/troop.actions"
import { useState, useTransition, useMemo } from "react"
import { Input } from "../ui/input"
import { useProperty } from "@/contexts/property-context"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { TroopDetailsModal } from "./troop-details-modal"
import { SECURITY_TROOP_ORDER, TROOP_TYPE_DEFENSE } from "@/lib/constants"
import { calcularTiempoReclutamiento } from "@/lib/formulas/troop-formulas"
import { cn } from "@/lib/utils"
import type { UserWithProgress, FullTropaUsuario, FullConfiguracionTropa, FullHabitacionUsuario } from "@/lib/types"

function formatNumber(num: number | bigint): string {
    const numberValue = Number(num);
    return numberValue.toLocaleString('de-DE');
}

function formatDuration(seconds: number): string {
    if (seconds <= 0) return "0s";
    const units: {name: string, seconds: number}[] = [
        { name: 'año', seconds: 31536000 },
        { name: 'sem', seconds: 604800 },
        { name: 'd', seconds: 86400 },
        { name: 'h', seconds: 3600 },
        { name: 'm', seconds: 60 },
        { name: 's', seconds: 1 }
    ];
    let remainingSeconds = seconds;
    let result = '';
    let parts = 0;
    for (const unit of units) {
        if (remainingSeconds >= unit.seconds && parts < 3) {
            const amount = Math.floor(remainingSeconds / unit.seconds);
            if (amount > 0) {
                result += `${amount}${unit.name} `;
                remainingSeconds %= unit.seconds;
                parts++;
            }
        }
    }
    return result.trim() || '0s';
}

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

function TroopForm({ troop }: { troop: TroopWithStats & { count: number } }) {
    const { selectedProperty } = useProperty();
    const [cantidad, setCantidad] = useState(0);
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();
    
    const colaReclutamientoActiva = !!selectedProperty?.colaReclutamiento;
    const nivelSeguridad = selectedProperty?.habitaciones.find((h: FullHabitacionUsuario) => h.configuracionHabitacionId === 'seguridad')?.nivel || 1;
    
    const costoTotal = useMemo(() => {
        return {
            armas: Number(troop.costoArmas) * cantidad,
            municion: Number(troop.costoMunicion) * cantidad,
            dolares: Number(troop.costoDolares) * cantidad,
        }
    }, [troop, cantidad]);

    const tiempoTotal = useMemo(() => {
        return calcularTiempoReclutamiento(troop, cantidad, nivelSeguridad);
    }, [troop, cantidad, nivelSeguridad]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProperty) return;

        setError('');
        startTransition(async () => {
            const result = await iniciarEntrenamientoSeguridad(selectedProperty.id, troop.id, cantidad);
            if (result?.error) {
                setError(result.error);
            } else {
                setCantidad(0);
            }
        });
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCantidad(c => Math.max(0, c - 1))}><Minus/></Button>
                 <Input 
                    type="number"
                    min="0"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-24 h-9 text-center"
                    disabled={colaReclutamientoActiva || isPending}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCantidad(c => c + 1)}><Plus/></Button>
            </div>
            {cantidad > 0 && (
                 <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-2 rounded-md">
                    <div className="flex justify-between"><span>Costo Total:</span> <span className="font-semibold">{formatNumber(costoTotal.armas)} Armas, {formatNumber(costoTotal.municion)} Munición, {formatNumber(costoTotal.dolares)} Dólares</span></div>
                    <div className="flex justify-between"><span>Tiempo Total:</span> <span className="font-semibold">{formatDuration(tiempoTotal)}</span></div>
                </div>
            )}
            <Button type="submit" variant="outline" size="sm" disabled={colaReclutamientoActiva || isPending || cantidad === 0} className="w-full">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (colaReclutamientoActiva ? <Ban className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />)}
                {isPending ? 'Entrenando...' : (colaReclutamientoActiva ? 'Cola ocupada' : 'Entrenar')}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </form>
    )
}

export function SecurityView({ user, defenseTroops }: SecurityViewProps) {
  const { selectedProperty } = useProperty();

  if (!selectedProperty) {
    return (
      <div className="main-view">
        <h2 className="text-3xl font-bold tracking-tight">Seguridad</h2>
        <Card>
          <CardContent className="p-6">
              <p>Por favor, selecciona una propiedad para gestionar tus defensas.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const userTroopsMap = new Map(selectedProperty.TropaUsuario.map((t: FullTropaUsuario) => [t.configuracionTropa.id, t]));
  const userTrainingsMap = new Map(user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));

  const troopsWithData = defenseTroops.map(config => {
    const userTropa = userTroopsMap.get(config.id);
     const requirements = config.requisitos || [];
    const meetsRequirements = requirements.every(reqId => (userTrainingsMap.get(reqId) || 0) >= 1);

    return {
      ...config,
      count: userTropa?.cantidad || 0,
      meetsRequirements,
    }
  });

  const unlockedTroops = troopsWithData.filter(t => t.meetsRequirements);

  const totalDefensePower = troopsWithData.reduce((acc, troop) => {
      return acc + (troop.defensaActual * troop.count);
  }, 0);

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Seguridad de la Propiedad</h2>
                <p className="text-muted-foreground">
                    Entrena unidades defensivas para: {selectedProperty.nombre}.
                </p>
            </div>
       </div>
       <Card>
            <CardHeader>
                <CardTitle>Estado Defensivo General</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-4">
                    <ShieldCheck className="h-10 w-10 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Poder de Defensa Total</p>
                        <p className="text-3xl font-bold">{formatNumber(totalDefensePower)}</p>
                    </div>
                </div>
            </CardContent>
       </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedTroops.map((troop, index) => (
            <Dialog key={troop.id}>
                <Card className={cn("security-card animate-fade-in-up", selectedProperty?.colaReclutamiento?.tropaId === troop.id && "border-primary animate-pulse")} style={{ animationDelay: `${index * 50}ms` }}>
                    <CardHeader>
                        <div className="relative w-full h-24 rounded-md overflow-hidden border">
                            <Image
                                src={troop.urlImagen || "https://placehold.co/80x56.png"}
                                alt={troop.nombre}
                                fill
                                className="object-contain"
                                data-ai-hint="mafia character defense"
                            />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>
                        <CardTitle className="text-center pt-2">{troop.nombre}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                         <div className="text-center bg-muted/50 p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Unidades Desplegadas</p>
                            <p className="text-xl font-bold">{formatNumber(troop.count)}</p>
                         </div>
                         <div className="flex justify-around text-center">
                            <div>
                                <p className="text-xs text-muted-foreground">Ataque</p>
                                <p className="font-bold flex items-center gap-1 justify-center"><Dumbbell className="h-3 w-3 text-red-500"/>{formatNumber(troop.ataqueActual)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Defensa</p>
                                <p className="font-bold flex items-center gap-1 justify-center"><ShieldCheck className="h-3 w-3 text-blue-500"/>{formatNumber(troop.defensaActual)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Salario</p>
                                <p className="font-bold flex items-center gap-1 justify-center"><DollarSign className="h-3 w-3 text-gray-400"/>{formatNumber(troop.salarioActual)}</p>
                            </div>
                         </div>
                        <TroopForm troop={troop} />
                    </CardContent>
                    <CardFooter>
                         <DialogTrigger asChild>
                            <Button variant="link" className="w-full">
                                <Info className="mr-2 h-4 w-4" /> Ver detalles
                            </Button>
                        </DialogTrigger>
                    </CardFooter>
                </Card>
                    <TroopDetailsModal 
                    troop={troop}
                    user={user}
                    ataqueActual={troop.ataqueActual}
                    defensaActual={troop.defensaActual}
                    capacidadActual={troop.capacidadActual}
                    velocidadActual={troop.velocidadActual}
                    salarioActual={troop.salarioActual}
                    />
            </Dialog>
            ))}
        </div>
    </div>
  )
}

    