
'use client';

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inspectUser } from "@/lib/actions/admin.actions";
import { UserWithProgress } from "@/lib/types";
import { Loader2, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UserInspectorViewProps {
    users: { id: string; name: string }[];
    selectedUserId?: string;
}

function formatNumber(num: number | bigint | string): string {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('de-DE');
}

function DataCard({ title, data, headers }: { title: string, data: (string | number)[][], headers: string[] }) {
    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">No hay datos disponibles.</p>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map(h => <TableHead key={h}>{h}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, i) => (
                            <TableRow key={i}>
                                {row.map((cell, j) => (
                                    <TableCell key={j} className={j > 0 ? 'font-mono text-right' : 'font-medium'}>
                                        {typeof cell === 'number' || typeof cell === 'bigint' ? formatNumber(cell) : cell}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export function UserInspectorView({ users, selectedUserId }: UserInspectorViewProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [userData, setUserData] = useState<UserWithProgress | null>(null);

    const handleUserSelect = (userId: string) => {
        router.push(`/admin/panel/inspector?userId=${userId}`);
    };

    useEffect(() => {
        if (selectedUserId) {
            startTransition(async () => {
                const freshData = await inspectUser(selectedUserId);
                setUserData(freshData);
            });
        } else {
            setUserData(null);
        }
    }, [selectedUserId]);


    const resourceData = userData?.propiedades.map(p => [
        p.nombre,
        formatNumber(p.armas),
        formatNumber(p.municion),
        formatNumber(p.alcohol),
        formatNumber(p.dolares),
    ]) || [];
    
    const roomData = userData?.propiedades.flatMap(p => p.habitaciones.map(h => [
        p.nombre,
        h.configuracionHabitacion.nombre,
        h.nivel
    ])) || [];
    
    const trainingData = userData?.entrenamientos.map(t => [
        t.configuracionEntrenamiento.nombre,
        t.nivel
    ]) || [];

    const allTroopConfigs = Array.from(new Set(userData?.propiedades.flatMap(p => [...p.TropaUsuario, ...p.TropaSeguridadUsuario].map(t => t.configuracionTropa))));
    const troopData = allTroopConfigs.map(config => {
        const total = userData?.propiedades.reduce((sum, p) => {
            const tu = p.TropaUsuario.find(t => t.configuracionTropaId === config.id)?.cantidad || 0;
            const tsu = p.TropaSeguridadUsuario.find(t => t.configuracionTropaId === config.id)?.cantidad || 0;
            return sum + Number(tu) + Number(tsu);
        }, 0) || 0;
        return [config.nombre, total];
    });


    return (
        <Card>
            <CardHeader>
                <CardTitle>Seleccionar Jugador</CardTitle>
                <CardDescription>Elige un jugador para ver sus datos en tiempo real. La vista se actualizará automáticamente.</CardDescription>
                <div className="flex items-center gap-2 pt-4">
                    <Select onValueChange={handleUserSelect} value={selectedUserId}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Selecciona un jugador..." />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Button onClick={() => selectedUserId && startTransition(async () => setUserData(await inspectUser(selectedUserId)))} disabled={isPending || !selectedUserId}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                        Forzar Actualización
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isPending && (
                     <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {userData && !isPending && (
                    <div className="space-y-6 animate-fade-in">
                        <DataCard title={`Recursos (${userData.propiedades.length} propiedades)`} headers={['Propiedad', 'Armas', 'Munición', 'Alcohol', 'Dólares']} data={resourceData} />
                        <Separator />
                        <div className="grid md:grid-cols-3 gap-6">
                            <DataCard title="Habitaciones" headers={['Propiedad', 'Habitación', 'Nivel']} data={roomData} />
                            <DataCard title="Tropas" headers={['Tropa', 'Cantidad Total']} data={troopData} />
                            <DataCard title="Entrenamientos" headers={['Entrenamiento', 'Nivel']} data={trainingData} />
                        </div>
                    </div>
                )}
                 {!selectedUserId && !isPending && (
                    <div className="text-center text-muted-foreground p-8">
                        <p>Selecciona un jugador para empezar la inspección.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
