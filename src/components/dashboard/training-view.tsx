
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
import { Clock, BrainCircuit, Info, Hourglass, Ban, Loader2 } from "lucide-react"
import { iniciarEntrenamiento } from "@/lib/actions/training.actions"
import type { FullConfiguracionEntrenamiento, UserWithProgress } from "@/lib/data"
import { useProperty } from "@/contexts/property-context"
import { useEffect, useState, useTransition } from "react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Terminal } from "lucide-react"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { TrainingDetailsModal } from "./training-details-modal"
import { cn } from "@/lib/utils"

function formatNumber(num: number): string {
    return num.toLocaleString('de-DE');
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

function TrainingQueueAlert({ user }: { user: UserWithProgress }) {
    const { selectedProperty } = useProperty();
    const [tiempoRestante, setTiempoRestante] = useState("");
    const colaEntrenamiento = user.colaEntrenamientos.find(c => c.propiedadId === selectedProperty?.id);

    useEffect(() => {
        if (!colaEntrenamiento) return;

        const interval = setInterval(() => {
            const ahora = new Date().getTime();
            const fin = new Date(colaEntrenamiento.fechaFinalizacion).getTime();
            const diferencia = Math.max(0, fin - ahora);
            setTiempoRestante(formatDuration(Math.floor(diferencia / 1000)));
        }, 1000);

        return () => clearInterval(interval);
    }, [colaEntrenamiento]);

    if (!selectedProperty || !colaEntrenamiento) return null;

    return (
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Entrenamiento en curso en {selectedProperty?.nombre}</AlertTitle>
            <AlertDescription>
                Entrenando {colaEntrenamiento.entrenamiento.nombre} a Nivel {colaEntrenamiento.nivelDestino}. Tiempo restante: {tiempoRestante}
            </AlertDescription>
        </Alert>
    )
}


function TrainingForm({ 
    training,
    propertyId,
    meetsRequirements,
    requirementsText,
    isTrainingInQueue,
    isPropertyBusy
}: { 
    training: TrainingData,
    propertyId: string,
    meetsRequirements: boolean,
    requirementsText: string | null,
    isTrainingInQueue: boolean,
    isPropertyBusy: boolean
}) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAction = async () => {
        startTransition(async () => {
            const result = await iniciarEntrenamiento(training.id, propertyId);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else if (result.success) {
                toast({ title: 'Éxito', description: result.success });
            }
        });
    }
    
    const isDisabled = isPending || !meetsRequirements || isTrainingInQueue || isPropertyBusy;

    return (
        <form action={handleAction}>
             {meetsRequirements ? (
                 <Button 
                    type="submit" 
                    variant="outline" 
                    size="sm" 
                    disabled={isDisabled}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {!isPending && (isTrainingInQueue ? <Hourglass className="mr-2 h-4 w-4 text-amber-500" /> : isPropertyBusy ? <Ban className="mr-2 h-4 w-4"/> : <BrainCircuit className="mr-2 h-4 w-4" />)}
                    {isPending ? 'Enviando...' : isTrainingInQueue ? 'En cola' : isPropertyBusy ? 'Ocupado' : 'Entrenar'}
                </Button>
            ) : (
                 <div className="text-xs text-destructive text-center p-2 bg-destructive/10 rounded-md">
                    <p className="font-bold">Requisitos no cumplidos:</p>
                    <p>{requirementsText}</p>
                </div>
            )}
        </form>
    )
}

type TrainingData = FullConfiguracionEntrenamiento & {
    nivel: number;
    costos: {
        armas: number;
        municion: number;
        dolares: number;
    };
    tiempo: number;
    meetsRequirements: boolean;
    requirementsText: string | null;
}

interface TrainingViewProps {
    user: UserWithProgress;
    trainingsData: TrainingData[];
}

export function TrainingView({ user, trainingsData }: TrainingViewProps) {
  const { selectedProperty } = useProperty();

  if (!selectedProperty) {
      return (
        <div className="main-view">
          <h2 className="text-3xl font-bold tracking-tight">Centro de Entrenamiento</h2>
          <Card><CardContent className="p-6">Selecciona una propiedad para ver los entrenamientos.</CardContent></Card>
        </div>
      )
  }

  const isPropertyBusy = user.colaEntrenamientos.some(c => c.propiedadId === selectedProperty.id);

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Centro de Entrenamiento</h2>
                <p className="text-muted-foreground">
                    Mejora tus habilidades desde {selectedProperty.nombre}.
                </p>
            </div>
       </div>
       <TrainingQueueAlert user={user} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {trainingsData.map((training, index) => {
                if(training.nivel === 0 && !training.meetsRequirements) {
                    return null;
                }

                const isTrainingInQueue = user.colaEntrenamientos.some(c => c.entrenamientoId === training.id);
                return (
                  <Dialog key={training.id}>
                    <Card className="training-card animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                        <CardHeader className="flex-row items-start gap-4">
                            <div className="w-20 h-16 relative rounded-md overflow-hidden border flex-shrink-0">
                                <Image
                                    src={training.urlImagen || "https://placehold.co/80x56.png"}
                                    alt={training.nombre}
                                    fill
                                    className="object-cover"
                                    data-ai-hint="skill icon"
                                />
                            </div>
                            <div>
                                <CardTitle className="font-heading tracking-wide">{training.nombre}</CardTitle>
                                <div className="text-sm text-primary font-bold">
                                Nivel {training.nivel}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <p className="text-sm text-muted-foreground min-h-[40px] line-clamp-2">
                                Mejora de {training.nombre.toLowerCase()} para desbloquear nuevas capacidades.
                            </p>
                            <div className="text-sm font-semibold">Mejora a Nivel: {training.nivel + 1}</div>
                            <div className="grid grid-cols-3 gap-x-3 text-sm">
                                {training.costos.armas > 0 && <div className="flex items-center gap-1.5" title={`${training.costos.armas.toLocaleString('de-DE')} Armas`}><Image src="/img/recursos/armas.svg" alt="Armas" width={16} height={16} /><span>{formatNumber(training.costos.armas)}</span></div>}
                                {training.costos.municion > 0 && <div className="flex items-center gap-1.5" title={`${training.costos.municion.toLocaleString('de-DE')} Munición`}><Image src="/img/recursos/municion.svg" alt="Munición" width={16} height={16} /><span>{formatNumber(training.costos.municion)}</span></div>}
                                {training.costos.dolares > 0 && <div className="flex items-center gap-1.5" title={`${training.costos.dolares.toLocaleString('de-DE')} Dólares`}><Image src="/img/recursos/dolares.svg" alt="Dólares" width={16} height={16} /><span>{formatNumber(training.costos.dolares)}</span></div>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(training.tiempo)}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <Info className="h-5 w-5" />
                                    </Button>
                                </DialogTrigger>
                                <TrainingForm 
                                    training={training}
                                    propertyId={selectedProperty.id}
                                    meetsRequirements={training.meetsRequirements}
                                    requirementsText={training.requirementsText}
                                    isTrainingInQueue={isTrainingInQueue}
                                    isPropertyBusy={isPropertyBusy}
                                />
                            </div>
                        </CardFooter>
                    </Card>
                     <TrainingDetailsModal training={{...training, level: training.nivel}} requirementsText={training.requirementsText} />
                  </Dialog>
                )
            })}
        </div>
    </div>
  )
}
