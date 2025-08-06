
'use client'

import { useMemo, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ColaMisiones, IncomingAttack, FullConfiguracionTropa } from "@/lib/types";
import { ArrowLeftRight, Check, Loader2, Shield, Swords, Undo2, Users, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cancelarMision } from "@/lib/actions/cancel-mission.action";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MissionDetailsViewProps {
    missions: ColaMisiones[];
    incomingAttacks: IncomingAttack[];
    troopConfigs: FullConfiguracionTropa[];
}

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

function Countdown({ endDate, onFinish }: { endDate: Date, onFinish: () => void }) {
    const [timeLeft, setTimeLeft] = useState(() => {
        const diff = new Date(endDate).getTime() - new Date().getTime();
        return Math.max(0, Math.floor(diff / 1000));
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = new Date(endDate).getTime() - new Date().getTime();
            const secondsLeft = Math.max(0, Math.floor(diff / 1000));
            setTimeLeft(secondsLeft);
            if (secondsLeft === 0) {
                clearInterval(interval);
                onFinish();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [endDate, onFinish]);

    return <span className="font-mono">{formatTime(timeLeft)}</span>;
}

const MissionRow = ({ mission, type, troopConfigs }: { mission: ColaMisiones | IncomingAttack, type: 'outgoing' | 'incoming' | 'returning', troopConfigs: FullConfiguracionTropa[] }) => {
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleCancel = (missionId: string) => {
        startTransition(async () => {
            const result = await cancelarMision(missionId);
            if(result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
            else toast({ title: 'Éxito', description: result.success });
        })
    }

    const isOutgoing = 'userId' in mission;
    const from = isOutgoing ? `${mission.origenCiudad}:${mission.origenBarrio}:${mission.origenEdificio}` : mission.attackerName;
    const to = isOutgoing ? `${mission.destinoCiudad}:${mission.destinoBarrio}:${mission.destinoEdificio}` : mission.targetProperty;
    const troops = isOutgoing ? (mission.tropas as {id: string, cantidad: number}[]).reduce((sum, t) => sum + t.cantidad, 0) : mission.totalTroops;
    const missionType = isOutgoing ? mission.tipoMision : "ATAQUE";
    const startDate = isOutgoing ? mission.fechaInicio : new Date(); // Placeholder for incoming
    const arrivalDate = isOutgoing ? mission.fechaLlegada : mission.arrivalTime;
    const returnDate = isOutgoing ? mission.fechaRegreso : null;

    const finalDate = type === 'returning' && returnDate ? returnDate : arrivalDate;

    return (
        <TableRow>
            <TableCell>
                <div><span className="font-semibold">{from}</span></div>
                <div className="text-muted-foreground">{to}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                 <div>{new Date(startDate).toLocaleString()}</div>
                 <div className="text-muted-foreground">{new Date(arrivalDate).toLocaleString()}</div>
            </TableCell>
            <TableCell><Countdown endDate={finalDate} onFinish={() => router.refresh()} /></TableCell>
            <TableCell className="text-center">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Users />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <div className="p-2 space-y-1">
                                <p className="font-bold">Tropas ({troops})</p>
                                {isOutgoing && (mission.tropas as {id: string; cantidad: number}[]).map(t => (
                                    <div key={t.id} className="flex justify-between gap-4">
                                        <span>{troopConfigs.find(c => c.id === t.id)?.nombre || t.id}</span>
                                        <span className="font-bold">{t.cantidad.toLocaleString()}</span>
                                    </div>
                                ))}
                           </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    {missionIcons[missionType]}
                    <span className="hidden sm:inline">{missionType}</span>
                </div>
            </TableCell>
             <TableCell className="text-right">
                {isOutgoing && missionType !== 'REGRESO' && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={isPending}>Cancelar</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Cancelar misión?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    La flota regresará inmediatamente. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>No</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancel(mission.id)} disabled={isPending}>
                                    {isPending ? <Loader2 className="animate-spin mr-2"/> : <X className="mr-2"/>}
                                    Confirmar cancelación
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </TableCell>
        </TableRow>
    );
};


export function MissionDetailsView({ missions, incomingAttacks, troopConfigs }: MissionDetailsViewProps) {
    
    const outgoingMissions = useMemo(() => missions.filter(m => m.tipoMision !== 'REGRESO'), [missions]);
    const returningMissions = useMemo(() => missions.filter(m => m.tipoMision === 'REGRESO'), [missions]);
    const allMovements = useMemo(() => [...outgoingMissions, ...incomingAttacks, ...returningMissions], [outgoingMissions, incomingAttacks, returningMissions]);

    const renderTable = (data: (ColaMisiones | IncomingAttack)[], type: 'outgoing' | 'incoming' | 'returning' | 'all') => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{type === 'incoming' ? 'Atacante/Destino' : 'Origen/Destino'}</TableHead>
                    <TableHead className="hidden sm:table-cell">Salida/Llegada</TableHead>
                    <TableHead>Tiempo Restante</TableHead>
                    <TableHead className="text-center">Tropas</TableHead>
                    <TableHead>Misión</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length > 0 ? (
                    data.map(item => <MissionRow key={item.id} mission={item} troopConfigs={troopConfigs} type={type === 'all' ? ('userId' in item ? (item.tipoMision === 'REGRESO' ? 'returning' : 'outgoing') : 'incoming') : type} />)
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">No hay flotas en esta categoría.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <Tabs defaultValue="all" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="all">Todas ({allMovements.length})</TabsTrigger>
                <TabsTrigger value="outgoing">En Misión ({outgoingMissions.length})</TabsTrigger>
                <TabsTrigger value="incoming">Enemigas ({incomingAttacks.length})</TabsTrigger>
                <TabsTrigger value="returning">Regresando ({returningMissions.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderTable(allMovements, 'all')}</TabsContent>
            <TabsContent value="outgoing">{renderTable(outgoingMissions, 'outgoing')}</TabsContent>
            <TabsContent value="incoming">{renderTable(incomingAttacks, 'incoming')}</TabsContent>
            <TabsContent value="returning">{renderTable(returningMissions, 'returning')}</TabsContent>
        </Tabs>
    )
}
