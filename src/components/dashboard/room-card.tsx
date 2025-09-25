
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
import { RoomDetailsModal } from "./room-details-modal"
import { cn, formatDuration, formatNumber } from "@/lib/utils"
import { Progress } from "../ui/progress"

// This type should be defined in a central place like `src/lib/types/index.ts`
// but for now, we define it here based on the data from RoomsView.
export type RoomCardData = {
    id: string;
    nombre: string;
    descripcion: string;
    urlImagen: string;
    nivel: number;
    nivelProyectado: number;
    nivelSiguiente: number;
    costos: {
        armas: number;
        municion: number;
        dolares: number;
        alcohol: number;
    };
    puntos: number;
    produccionBase: number;
    produccionRecurso: string | null;
    tiempo: number;
    enConstruccion: boolean;
    construccionActiva?: {
        id: string;
        duracion: number;
    };
    meetsRequirements: boolean;
    requirementsText: string | null;
};

interface RoomCardProps {
    room: RoomCardData;
    timeLeft: number | undefined;
    isQueueFull: boolean;
    isSubmitting: boolean;
    onUpgrade: (roomId: string) => void;
    index: number;
}

export function RoomCard({ room, timeLeft, isQueueFull, isSubmitting, onUpgrade, index }: RoomCardProps) {
    const progress = room.construccionActiva && timeLeft !== undefined ? 100 - (timeLeft / room.construccionActiva.duracion) * 100 : 0;

    return (
        <Dialog>
            <Card className={cn(
                "room-card animate-fade-in-up flex flex-col",
                isSubmitting && "border-amber-500 animate-pulse",
                !room.meetsRequirements && "opacity-60"
            )}
                style={{ animationDelay: `${index * 50}ms` }}
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
                            <Progress value={progress} className="h-2 bg-amber-500/20" indicatorClassName="bg-amber-500" />
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{room.descripcion}</p>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-x-3">
                            {room.costos.armas > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.armas.toLocaleString('de-DE')} Armas`}><Image src="/img/recursos/armas.svg" alt="Armas" width={16} height={16} /><span>{formatNumber(room.costos.armas)}</span></div>}
                            {room.costos.municion > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.municion.toLocaleString('de-DE')} Munición`}><Image src="/img/recursos/municion.svg" alt="Munición" width={16} height={16} /><span>{formatNumber(room.costos.municion)}</span></div>}
                            {room.costos.dolares > 0 && <div className="flex items-center gap-1.5" title={`${room.costos.dolares.toLocaleString('de-DE')} Dólares`}><Image src="/img/recursos/dolares.svg" alt="Dólares" width={16} height={16} /><span>{formatNumber(room.costos.dolares)}</span></div>}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(room.tiempo)}</span>
                        </div>
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
                        <form className="flex-grow" action={() => onUpgrade(room.id)}>
                            {room.meetsRequirements ? (
                                <Button type="submit" variant="outline" size="sm" className="w-full" disabled={isQueueFull || isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isQueueFull ? <Ban className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
                                    {isSubmitting ? 'Enviando...' : (isQueueFull ? 'Cola llena' : `Ampliar a Nvl ${room.nivelSiguiente}`)}
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
                 <RoomDetailsModal room={{
                    ...room,
                    nivel: room.nivelProyectado,
                    costoArmas: BigInt(room.costos.armas),
                    costoMunicion: BigInt(room.costos.municion),
                    costoDolares: BigInt(room.costos.dolares),
                    duracion: room.tiempo,
                    // Estos son campos que necesita RoomWithLevel pero no están en RoomCardData
                    // Se pueden añadir con valores por defecto o traerlos desde el servidor si son necesarios
                    requisitos: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }} />
            </Card>
        </Dialog>
    )
}
