'use client'

import Image from "next/image"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, PlusCircle, Ban, Info, Loader2, Dumbbell, ShieldCheck, Warehouse, Wind, DollarSign } from "lucide-react"
import { iniciarReclutamiento } from "@/lib/actions/troop.actions"
import { useEffect, useState, useTransition } from "react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Terminal } from "lucide-react"
import { Input } from "../ui/input"
import { useProperty } from "@/contexts/property-context"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { TroopDetailsModal } from "./troop-details-modal"
import { RECRUITMENT_TROOP_ORDER, TROOP_TYPE_DEFENSE } from "@/lib/constants"
import type { UserWithProgress, FullConfiguracionTropa, FullTropaUsuario } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

function formatNumber(num: number | bigint): string {
    const numberValue = Number(num);
    if (numberValue < 1000) {
      return numberValue.toString();
    }
    const suffixes = ["", "K", "M", "B", "T"];
    const i = Math.floor(Math.log10(numberValue) / 3);
    const shortValue = (numberValue / Math.pow(1000, i));
    return shortValue.toFixed(i > 0 ? 2 : 0) + suffixes[i];
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

type RecruitmentViewProps = {
    troopConfigsWithStats: TroopWithStats[];
    user: UserWithProgress;
}

function RecruitmentQueueAlert() {
    const { selectedProperty } = useProperty();
    const [tiempoRestante, setTiempoRestante] = useState("");
    const colaReclutamiento = selectedProperty?.colaReclutamiento;

    useEffect(() => {
        if (!colaReclutamiento) return;

        const interval = setInterval(() => {
            const ahora = new Date().getTime();
            const fin = new Date(colaReclutamiento.fechaFinalizacion).getTime();
            const diferencia = Math.max(0, fin - ahora);
            setTiempoRestante(formatDuration(Math.floor(diferencia / 1000)));
        }, 1000);

        return () => clearInterval(interval);
    }, [colaReclutamiento]);

    if (!selectedProperty || !colaReclutamiento) return null;

    return (
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Reclutamiento en curso en {selectedProperty?.nombre}</AlertTitle>
            <AlertDescription>
                Reclutando {colaReclutamiento.cantidad} x {colaReclutamiento.tropaConfig.nombre}. Tiempo restante: {tiempoRestante}
            </AlertDescription>
        </Alert>
    )
}

function TroopForm({ troopId }: { troopId: string }) {
    const { selectedProperty } = useProperty();
    const { toast } = useToast();
    const [cantidad, setCantidad] = useState(1);
    const [isPending, startTransition] = useTransition();
    
    const colaReclutamientoActiva = !!selectedProperty?.colaReclutamiento;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProperty) return;

        startTransition(async () => {
            const result = await iniciarReclutamiento(selectedProperty.id, troopId, cantidad);
            if (result?.error) {
                toast({ variant: 'destructive', title: "Error de Reclutamiento", description: result.error})
            } else if (result?.success) {
                toast({ title: "¡Éxito!", description: result.success})
            }
        });
    }
    
    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input 
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-20 h-9"
                disabled={colaReclutamientoActiva || isPending}
            />
            <Button type="submit" variant="outline" size="sm" disabled={colaReclutamientoActiva || isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (colaReclutamientoActiva ? <Ban className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
                {isPending ? 'Enviando...' : (colaReclutamientoActiva ? 'En cola' : 'Reclutar')}
            </Button>
        </form>
    )
}

export function RecruitmentView({ user, troopConfigsWithStats }: RecruitmentViewProps) {
  const { selectedProperty } = useProperty();

  if (!selectedProperty) {
    return (
      <div className="main-view">
        <h2 className="text-3xl font-bold tracking-tight">Reclutamiento</h2>
        <Card>
          <CardContent className="p-6">
              <p>Por favor, selecciona una propiedad para reclutar tropas.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userTroopsMap = new Map(selectedProperty.TropaUsuario.map((t: FullTropaUsuario) => [t.configuracionTropa.id, t]));
  const userTrainingsMap = new Map(user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));

  const troopsWithData = troopConfigsWithStats.map(config => {
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

  const sortedTroops = [...unlockedTroops]
    .filter(t => t.tipo !== TROOP_TYPE_DEFENSE)
    .sort((a, b) => {
        const indexA = RECRUITMENT_TROOP_ORDER.indexOf(a.id);
        const indexB = RECRUITMENT_TROOP_ORDER.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Reclutamiento de Tropas</h2>
                <p className="text-muted-foreground">
                    Reclutando en: {selectedProperty.nombre}.
                </p>
            </div>
       </div>
        <RecruitmentQueueAlert />
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
              {sortedTroops.map((troop) => (
                <Dialog key={troop.id}>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-3 flex items-start gap-4">
                        <div className="w-20 h-16 relative rounded-md overflow-hidden border flex-shrink-0">
                            <Image
                                src={troop.urlImagen || "https://placehold.co/80x56.png"}
                                alt={troop.nombre}
                                fill
                                className="object-contain"
                                data-ai-hint="mafia character unit"
                            />
                        </div>
                        <div>
                            <div className="font-bold">{troop.nombre}</div>
                            <div className="text-xs text-muted-foreground">
                                Posees: <span className="text-primary font-bold">{troop.count}</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <p className="text-sm text-muted-foreground">{troop.descripcion}</p>
                    </div>
                    
                    <div className="md:col-span-5">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                            <div className="flex flex-col gap-2 text-sm flex-grow">
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className="flex items-center gap-2" title="Ataque"><Dumbbell className="h-3 w-3 text-red-500"/><span>{formatNumber(troop.ataqueActual)}</span></div>
                                    <div className="flex items-center gap-2" title="Defensa"><ShieldCheck className="h-3 w-3 text-blue-500"/><span>{formatNumber(troop.defensaActual)}</span></div>
                                    <div className="flex items-center gap-2" title="Capacidad de Carga"><Warehouse className="h-3 w-3 text-yellow-500"/><span>{formatNumber(troop.capacidadActual)}</span></div>
                                    <div className="flex items-center gap-2" title="Velocidad"><Wind className="h-3 w-3 text-green-500"/><span>{formatNumber(troop.velocidadActual)}</span></div>
                                    <div className="flex items-center gap-2" title="Salario"><DollarSign className="h-3 w-3 text-gray-400"/><span>{formatNumber(troop.salarioActual)}</span></div>
                                </div>
                                <div className="grid grid-cols-3 gap-x-3">
                                    {Number(troop.costoArmas) > 0 && <div className="flex items-center gap-1.5" title={`${Number(troop.costoArmas).toLocaleString('de-DE')} Armas`}><Image src="/img/recursos/armas.svg" alt="Armas" width={16} height={16} /><span>{formatNumber(troop.costoArmas)}</span></div>}
                                    {Number(troop.costoMunicion) > 0 && <div className="flex items-center gap-1.5" title={`${Number(troop.costoMunicion).toLocaleString('de-DE')} Munición`}><Image src="/img/recursos/municion.svg" alt="Munición" width={16} height={16} /><span>{formatNumber(troop.costoMunicion)}</span></div>}
                                    {Number(troop.costoDolares) > 0 && <div className="flex items-center gap-1.5" title={`${Number(troop.costoDolares).toLocaleString('de-DE')} Dólares`}><Image src="/img/recursos/dolares.svg" alt="Dólares" width={16} height={16} /><span>{formatNumber(troop.costoDolares)}</span></div>}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDuration(troop.duracion)} por unidad</span>
                                </div>
                            </div>
                             <div className="flex items-center gap-2">
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <Info className="h-5 w-5" />
                                        <span className="sr-only">Detalles</span>
                                    </Button>
                                </DialogTrigger>
                                <TroopForm troopId={troop.id} />
                             </div>
                        </div>
                    </div>
                    </div>
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
        </CardContent>
      </Card>
    </div>
  )
}
