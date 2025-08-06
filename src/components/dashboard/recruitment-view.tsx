
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
import { Clock, PlusCircle, Ban, Info, Loader2, Dumbbell, ShieldCheck, Warehouse, Wind, DollarSign, Minus, Plus } from "lucide-react"
import { iniciarReclutamiento } from "@/lib/actions/troop.actions"
import { useEffect, useState, useTransition, useMemo } from "react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Terminal } from "lucide-react"
import { Input } from "../ui/input"
import { useProperty } from "@/contexts/property-context"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { TroopDetailsModal } from "./troop-details-modal"
import { RECRUITMENT_TROOP_ORDER, TROOP_TYPE_DEFENSE } from "@/lib/constants"
import type { UserWithProgress, FullConfiguracionTropa, FullTropaUsuario } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Slider } from "../ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel"

function formatNumber(num: number | bigint): string {
    const numberValue = Number(num);
    if (numberValue < 1000) {
      return numberValue.toString();
    }
    const suffixes = ["", "K", "M", "B", "T"];
    const i = Math.floor(Math.log10(numberValue) / 3);
    const shortValue = (numberValue / Math.pow(1000, i));
    return shortValue.toFixed(i > 0 ? 1 : 0) + suffixes[i];
  }

function formatDuration(seconds: number): string {
    if (seconds <= 0) return "0s";

    const units: {name: string, seconds: number}[] = [
        { name: 'd', seconds: 86400 },
        { name: 'h', seconds: 3600 },
        { name: 'm', seconds: 60 },
        { name: 's', seconds: 1 }
    ];

    let remainingSeconds = seconds;
    let result = '';
    let parts = 0;

    for (const unit of units) {
        if (remainingSeconds >= unit.seconds && parts < 2) {
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

function TroopForm({ troop, availableCount }: { troop: TroopWithStats, availableCount: number }) {
    const { selectedProperty } = useProperty();
    const { toast } = useToast();
    const [cantidad, setCantidad] = useState(0);
    const [isPending, startTransition] = useTransition();
    
    const colaReclutamientoActiva = !!selectedProperty?.colaReclutamiento;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProperty || cantidad === 0) return;

        startTransition(async () => {
            const result = await iniciarReclutamiento(selectedProperty.id, troop.id, cantidad);
            if (result?.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: '\u00c9xito', description: `Reclutando ${cantidad} x ${troop.nombre}.` });
                setCantidad(0);
            }
        });
    }
    
    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className='flex items-center gap-1 w-full'>
                <Slider
                    value={[cantidad]}
                    onValueChange={(value) => setCantidad(value[0])}
                    max={availableCount}
                    step={1}
                    className="flex-1"
                    disabled={colaReclutamientoActiva || isPending}
                />
                 <Input 
                    type='number'
                    min="0"
                    max={availableCount}
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                    className='h-8 w-20 text-center'
                    disabled={colaReclutamientoActiva || isPending}
                />
            </div>
            <Button type="submit" variant="destructive" size="sm" disabled={colaReclutamientoActiva || isPending || cantidad === 0}>
                {isPending ? <Loader2 className="animate-spin" /> : (colaReclutamientoActiva ? <Ban/> : <PlusCircle />)}
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
        <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
              {sortedTroops.map((troop, index) => (
                <CarouselItem key={troop.id} className="md:basis-1/2 lg:basis-1/3">
                <Dialog>
                    <Card className="troop-card animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                        <CardHeader className="relative p-0 h-32 overflow-hidden">
                           <Image
                                src={troop.urlImagen || "https://placehold.co/200x128.png"}
                                alt={troop.nombre}
                                fill
                                className="object-contain"
                                data-ai-hint="mafia character unit"
                            />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                                <CardTitle className="text-white [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">{troop.nombre}</CardTitle>
                                <div className="text-sm text-primary-foreground/90 font-bold [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                                    Posees: <span className="text-primary-foreground">{troop.count}</span>
                                </div>
                            </div>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20">
                                    <Info className="h-5 w-5" />
                                    <span className="sr-only">Detalles</span>
                                </Button>
                            </DialogTrigger>
                        </CardHeader>

                        <CardContent className="flex-grow space-y-3 p-4">
                             <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-center text-xs">
                                <div title="Ataque"><Dumbbell className="h-3 w-3 mx-auto mb-1 text-red-500"/>{formatNumber(troop.ataqueActual)}</div>
                                <div title="Defensa"><ShieldCheck className="h-3 w-3 mx-auto mb-1 text-blue-500"/>{formatNumber(troop.defensaActual)}</div>
                                <div title="Capacidad de Carga"><Warehouse className="h-3 w-3 mx-auto mb-1 text-yellow-500"/>{formatNumber(troop.capacidadActual)}</div>
                                <div title="Velocidad"><Wind className="h-3 w-3 mx-auto mb-1 text-green-500"/>{formatNumber(troop.velocidadActual)}</div>
                                <div title="Salario"><DollarSign className="h-3 w-3 mx-auto mb-1 text-gray-400"/>{formatNumber(troop.salarioActual)}</div>
                                <div title="Tiempo"><Clock className="h-3 w-3 mx-auto mb-1 text-gray-400" />{formatDuration(troop.duracion)}</div>
                            </div>
                            <div className="flex items-center justify-center gap-x-3 text-sm">
                                {Number(troop.costoArmas) > 0 && <div className="flex items-center gap-1.5" title={`${Number(troop.costoArmas).toLocaleString('de-DE')} Armas`}><Image src="/img/recursos/armas.svg" alt="Armas" width={16} height={16} /><span>{formatNumber(troop.costoArmas)}</span></div>}
                                {Number(troop.costoMunicion) > 0 && <div className="flex items-center gap-1.5" title={`${Number(troop.costoMunicion).toLocaleString('de-DE')} Munición`}><Image src="/img/recursos/municion.svg" alt="Munición" width={16} height={16} /><span>{formatNumber(troop.costoMunicion)}</span></div>}
                                {Number(troop.costoDolares) > 0 && <div className="flex items-center gap-1.5" title={`${Number(troop.costoDolares).toLocaleString('de-DE')} Dólares`}><Image src="/img/recursos/dolares.svg" alt="Dólares" width={16} height={16} /><span>{formatNumber(troop.costoDolares)}</span></div>}
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                           <TroopForm troop={troop} availableCount={troop.count} />
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
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

    