
'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeftRight, Check, Shield, Swords, Undo2, X, Loader2 } from "lucide-react";
import { cancelarMision } from "@/lib/actions/cancel-mission.action";
import { useToast } from "@/hooks/use-toast";
import { IncomingAttack, ColaMisiones, FullConfiguracionTropa as ConfiguracionTropa } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";

type MissionStatusProps = {
    missions: ColaMisiones[];
    incomingAttacks: IncomingAttack[];
    allTroops: ConfiguracionTropa[];
};

const missionIcons: { [key: string]: React.ReactNode } = {
    ATAQUE: <Swords className="h-4 w-4 text-destructive" />,
    DEFENDER: <Shield className="h-4 w-4 text-blue-500" />,
    TRANSPORTE: <ArrowLeftRight className="h-4 w-4 text-green-500" />,
    ESPIONAJE: <ArrowLeftRight className="h-4 w-4 text-yellow-500" />,
    OCUPAR: <Check className="h-4 w-4 text-primary" />,
    REGRESO: <Undo2 className="h-4 w-4 text-gray-400" />,
};

function formatTime(totalSeconds: number): string {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}

function CountdownTimer({ label, endDate, onFinish, className }: {label: string, endDate: Date, onFinish: () => void, className?: string}) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const end = new Date(endDate).getTime();
        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const difference = Math.floor((end - now) / 1000);

            if (difference < -1) { 
                setTimeLeft('00:00:00');
                clearInterval(intervalId);
                onFinish();
            } else {
                setTimeLeft(formatTime(difference));
            }
        }, 1000);
        
        const now = new Date().getTime();
        const difference = Math.floor((end - now) / 1000);
        setTimeLeft(formatTime(difference > 0 ? difference : 0));

        return () => clearInterval(intervalId);
    }, [endDate, onFinish]);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm">
            <span>{label}</span>
            <span className={`font-mono font-bold ${className}`}>{timeLeft}</span>
        </div>
    );
}

function OutgoingMission({ mission, allTroops }: { mission: ColaMisiones, allTroops: ConfiguracionTropa[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [status, setStatus] = useState<{label: string, endDate: Date | null}>({
        label: "Calculando...",
        endDate: null,
    });
    
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            
            let currentLabel = "Llegando";
            let currentEndDate: Date | null = mission.fechaLlegada;

            if (mission.tipoMision === 'REGRESO') {
                currentLabel = "Regresando";
                currentEndDate = mission.fechaRegreso;
            } else if (mission.fechaLlegada && now > new Date(mission.fechaLlegada).getTime()) {
                if (mission.fechaRegreso) {
                    currentLabel = "Regresando";
                    currentEndDate = mission.fechaRegreso;
                } else {
                    setStatus({ label: "Finalizada", endDate: null });
                    router.refresh();
                    return;
                }
            }
            
            if (!currentEndDate || now > new Date(currentEndDate).getTime()) {
                setStatus({ label: "Completada", endDate: null });
                router.refresh();
                return;
            }
            setStatus({ label: currentLabel, endDate: currentEndDate });
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        return () => clearInterval(intervalId);

    }, [mission, router]);
    
    if (!status.endDate) return null;

    const handleCancel = () => {
        startTransition(async () => {
            const result = await cancelarMision(mission.id);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Misión cancelada', description: result.success });
            }
        });
    };

    const canCancel = mission.tipoMision !== 'REGRESO' && new Date() < new Date(mission.fechaLlegada);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm group">
            <div className="flex items-center gap-2">
                {missionIcons[mission.tipoMision]}
                <span className={mission.tipoMision === 'REGRESO' ? 'text-green-400' : ''}>
                    {mission.tipoMision} a {mission.destinoCiudad}:{mission.destinoBarrio}:{mission.destinoEdificio}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {status.endDate && (
                    <CountdownTimer 
                        label=''
                        endDate={status.endDate}
                        onFinish={() => router.refresh()}
                        className={mission.tipoMision === 'REGRESO' ? 'text-green-400' : 'text-accent'}
                    />
                )}
                {canCancel && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 text-destructive/80 hover:text-destructive">
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Cancelar Misión?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tu flota regresará inmediatamente. El tiempo de regreso será igual al tiempo que ha estado en viaje. ¿Estás seguro?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>No</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancel} disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Sí, cancelar misión
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
}

const getMovementArrival = (movement: ColaMisiones | IncomingAttack): Date => {
    if ('fechaLlegada' in movement) {
        return movement.fechaLlegada;
    }
    return movement.arrivalTime;
}

export function MissionStatus({ missions, incomingAttacks, allTroops }: MissionStatusProps) {
    const router = useRouter();
    const allMovements = [
        ...missions,
        ...incomingAttacks
    ].sort((a,b) => getMovementArrival(a).getTime() - getMovementArrival(b).getTime());

    return (
        <div className="bg-card text-card-foreground px-4 py-3 rounded-b-md space-y-2">
            {allMovements.length > 0 ? (
                allMovements.map(movement => {
                    if ('userId' in movement) { // Es una ColaMisiones (saliente o de regreso)
                        return <OutgoingMission key={movement.id} mission={movement} allTroops={allTroops} />
                    } else { // Es un IncomingAttack
                        return (
                             <div key={movement.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-destructive">
                                <div className="flex items-center gap-2">
                                    <Swords className="h-4 w-4"/>
                                    <span>Ataque de {movement.attackerName}</span>
                                </div>
                                <CountdownTimer 
                                    label=''
                                    endDate={movement.arrivalTime}
                                    onFinish={() => router.refresh()}
                                    className='text-destructive'
                                />
                            </div>
                        )
                    }
                })
            ) : (
                <p className="text-muted-foreground text-center text-sm py-2">Ninguna unidad en movimiento</p>
            )}
        </div>
    )
}
