
'use client'

import Image from "next/image"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, PlusCircle, Ban, Info, Loader2 } from "lucide-react"
import { iniciarAmpliacion } from "@/lib/actions/room.actions"
import { ConstructionQueue } from "./construction-queue"
import { useEffect, useState, useTransition } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { RoomDetailsModal } from "./room-details-modal"
import { useProperty } from "@/contexts/property-context"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip"
import { calcularCostosNivel, calcularTiempoConstruccion } from "@/lib/formulas/room-formulas"
import type { FullConfiguracionHabitacion, UserWithProgress, FullPropiedad } from "@/lib/types"
import { ID_OFICINA_JEFE, MAX_CONSTRUCTION_QUEUE_SIZE, ROOM_ORDER } from "@/lib/constants"
import { Progress } from "../ui/progress"
import { cn } from "@/lib/utils"

function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  const suffixes = ["", "K", "M", "B", "T"];
  const i = Math.floor(Math.log10(num) / 3);
  const shortValue = (num / Math.pow(1000, i));
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

type RoomsViewProps = {
    user: UserWithProgress;
    allRoomConfigs: FullConfiguracionHabitacion[];
    initialProperty?: FullPropiedad;
}

export function RoomsView({ user, allRoomConfigs, initialProperty }: RoomsViewProps) {
    const router = useRouter();
    const { selectedProperty: contextSelectedProperty } = useProperty();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const { toast } = useToast();
    const [timers, setTimers] = useState<Record<string, number>>({});

    const selectedProperty = initialProperty || contextSelectedProperty;

    useEffect(() => {
        if (!selectedProperty) return;

        const construccionEnCola = selectedProperty.colaConstruccion;

        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            let hasChanged = false;
            const newTimers: Record<string, number> = {};

            construccionEnCola.forEach(item => {
                if(item.fechaFinalizacion) {
                    const endTime = new Date(item.fechaFinalizacion).getTime();
                    const newTimeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
                    
                    if (timers[item.id] !== newTimeLeft) {
                        newTimers[item.id] = newTimeLeft;
                        hasChanged = true;
                    }
                     if (newTimeLeft === 0 && timers[item.id] > 0) {
                        router.refresh();
                    }
                }
            });

            if (hasChanged) {
                setTimers(newTimers);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [selectedProperty, timers, router]);

    if (!selectedProperty) {
      return (
        <div className="main-view">
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Habitaciones</h2>
          <Card>
            <CardContent className="p-6">
                <p>Por favor, selecciona una propiedad para gestionar sus habitaciones.</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    const construccionEnCola = selectedProperty.colaConstruccion;


    const isQueueFull = construccionEnCola.length >= MAX_CONSTRUCTION_QUEUE_SIZE;

    const handleAmpliacion = async (habitacionId: string) => {
        if (!selectedProperty) return;
        setIsSubmitting(habitacionId);
        const resultado = await iniciarAmpliacion(selectedProperty.id, habitacionId);
        if (resultado?.error) {
            toast({
                title: "Error al ampliar",
                description: resultado.error,
                variant: "destructive"
            })
        } else if (resultado?.success) {
            toast({
                title: "¡Éxito!",
                description: resultado.success
            })
        }
    }

    const simpleRoomConfigs = allRoomConfigs.map(r => ({ id: r.id, nombre: r.nombre, urlImagen: r.urlImagen }));

    const userRoomsMap = new Map(selectedProperty.habitaciones.map(h => [h.configuracionHabitacionId, h]));
      
    const roomsData = ROOM_ORDER.map(id => {
        const config = allRoomConfigs.find(c => c.id === id);
        if (!config) return null;

        const userRoom = userRoomsMap.get(id);
        const nivelBase = userRoom ? userRoom.nivel : 0;
        
        const mejorasEnCola = construccionEnCola.filter(c => c.habitacionId === id);
        const nivelProyectado = nivelBase + mejorasEnCola.length;
        const nivelSiguiente = nivelProyectado + 1;

        const nivelOficinaJefe = userRoomsMap.get(ID_OFICINA_JEFE)?.nivel || 1;
        
        const costosSiguienteNivel = calcularCostosNivel(nivelSiguiente, config);
        const tiempoSiguienteNivel = calcularTiempoConstruccion(nivelSiguiente, config, nivelOficinaJefe);
        
        const requirements = config.requisitos || [];
        const meetsRequirements = requirements.every(req => (userRoomsMap.get(req.requiredRoomId)?.nivel || 0) >= req.requiredLevel);
        const requirementsText = !meetsRequirements
            ? requirements.map(req => `${allRoomConfigs.find(r=>r.id === req.requiredRoomId)?.nombre || req.requiredRoomId} (Nvl ${req.requiredLevel})`).join(', ')
            : null;
        
        const construccionActiva = mejorasEnCola.find(c => c.fechaFinalizacion);

        return {
            ...config,
            nivel: nivelBase,
            nivelProyectado,
            nivelSiguiente,
            costos: costosSiguienteNivel,
            tiempo: tiempoSiguienteNivel,
            enConstruccion: !!construccionActiva,
            construccionActiva,
            meetsRequirements,
            requirementsText,
        };
    }).filter((r): r is NonNullable<typeof r> => r !== null && (r.nivel > 0 || r.meetsRequirements));


    return (
        <div className="space-y-4">
            <ConstructionQueue propiedad={selectedProperty} allRooms={simpleRoomConfigs} />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Habitaciones</h2>
                    <p className="text-muted-foreground">
                        Amplía y gestiona los edificios de tu propiedad: {selectedProperty.nombre}.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {roomsData.map((room, index) => {
                     const timeLeft = room.construccionActiva ? timers[room.construccionActiva.id] : undefined;
                     const progress = room.construccionActiva && timeLeft !== undefined ? 100 - (timeLeft / room.construccionActiva.duracion) * 100 : 0;

                    return (
                        <Dialog key={room.id}>
                             <Card className={cn(
                                "room-card animate-fade-in-up", 
                                isSubmitting === room.id && "border-amber-500 animate-pulse",
                                !room.meetsRequirements && "opacity-60"
                            )}
                            style={{ animationDelay: `${index * 50}ms`}}
                            >
                                <CardHeader className="relative p-0 overflow-hidden h-32">
                                     <Image
                                        src={room.urlImagen || "https://placehold.co/200x128.png"}
                                        alt={room.nombre}
                                        fill
                                        className="object-cover"
                                        data-ai-hint="game building"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                                         <CardTitle className="text-white [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">{room.nombre}</CardTitle>
                                         <div className="text-sm text-primary-foreground/90 font-bold [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                                          Nivel {room.nivelProyectado}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-3 p-4">
                                   {room.enConstruccion && room.construccionActiva && timeLeft !== undefined && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-baseline text-xs">
                                                <span className="text-amber-500 font-semibold">En progreso...</span>
                                                <span className="font-mono">{formatDuration(timeLeft)}</span>
                                            </div>
                                            <Progress value={progress} className="h-2 bg-amber-500/20" indicatorClassName="bg-amber-500"/>
                                        </div>
                                   )}
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{room.descripcion}</p>
                                     <div className="grid grid-cols-3 gap-x-3 text-sm">
                                        {room.costos.armas > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.armas.toLocaleString('de-DE')} Armas`}><Image src="/img/recursos/armas.svg" alt="Armas" width={16} height={16} /><span>{formatNumber(room.costos.armas)}</span></div>}
                                        {room.costos.municion > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.municion.toLocaleString('de-DE')} Munición`}><Image src="/img/recursos/municion.svg" alt="Munición" width={16} height={16} /><span>{formatNumber(room.costos.municion)}</span></div>}
                                        {room.costos.dolares > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.dolares.toLocaleString('de-DE')} Dólares`}><Image src="/img/recursos/dolares.svg" alt="Dólares" width={16} height={16} /><span>{formatNumber(room.costos.dolares)}</span></div>}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatDuration(room.tiempo)}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <div className="flex items-center gap-2 w-full">
                                         <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                                <Info className="h-5 w-5" />
                                                <span className="sr-only">Detalles</span>
                                            </Button>
                                        </DialogTrigger>
                                        <form className="flex-grow" action={() => handleAmpliacion(room.id)}>
                                             {room.meetsRequirements ? (
                                                <Button type="submit" variant="outline" size="sm" className="w-full" disabled={isQueueFull || isSubmitting === room.id}>
                                                    {isSubmitting === room.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (isQueueFull ? <Ban className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
                                                    {isSubmitting === room.id ? 'Enviando...' : (isQueueFull ? 'Cola llena' : `Ampliar a Nvl ${room.nivelSiguiente}`)}
                                                </Button>
                                            ) : (
                                                <div className="text-xs text-destructive text-center p-2 bg-destructive/10 rounded-md">
                                                    <p className="font-bold">Requisitos no cumplidos:</p>
                                                    <p>{room.requirementsText}</p>
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                </CardFooter>
                                <RoomDetailsModal room={{...room, nivel: room.nivelProyectado}} />
                            </Card>
                        </Dialog>
                    )}
                )}
            </div>
        </div>
    )
}
