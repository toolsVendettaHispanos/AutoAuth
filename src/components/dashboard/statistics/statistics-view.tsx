
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ConfiguracionHabitacion, ConfiguracionTropa, ConfiguracionEntrenamiento, HabitacionUsuario, EntrenamientoUsuario } from "@prisma/client";
import { UserWithProgress } from "@/lib/data";
import { StatTableCard } from "./stat-table-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TroopStat {
    userId: string;
    total: number;
    configuracionTropaId: string;
}

interface ResourceStat {
    name: string;
    maxValue: number;
}

interface StatisticsViewProps {
    currentUser: UserWithProgress;
    allRoomConfigs: ConfiguracionHabitacion[];
    allTrainingConfigs: ConfiguracionEntrenamiento[];
    allTroopConfigs: ConfiguracionTropa[];
    roomStats: HabitacionUsuario[];
    trainingStats: EntrenamientoUsuario[];
    troopStats: TroopStat[];
    resourceStats: ResourceStat[];
}

export function StatisticsView({
    currentUser,
    allRoomConfigs,
    allTrainingConfigs,
    allTroopConfigs,
    roomStats,
    trainingStats,
    troopStats,
    resourceStats
}: StatisticsViewProps) {

    // Process room stats
    const maxRoomLevels = new Map<string, number>();
    roomStats.forEach(stat => {
        const currentMax = maxRoomLevels.get(stat.configuracionHabitacionId) || 0;
        if (stat.nivel > currentMax) {
            maxRoomLevels.set(stat.configuracionHabitacionId, stat.nivel);
        }
    });

    const currentUserRoomLevels = new Map<string, number>();
    currentUser.propiedades.forEach(p => {
        p.habitaciones.forEach(h => {
            const currentLevel = currentUserRoomLevels.get(h.configuracionHabitacionId) || 0;
            if (h.nivel > currentLevel) {
                 currentUserRoomLevels.set(h.configuracionHabitacionId, h.nivel);
            }
        });
    });

    const roomStatData = allRoomConfigs.map(config => ([
        config.nombre,
        currentUserRoomLevels.get(config.id) || 0,
        maxRoomLevels.get(config.id) || 0,
    ]));

    // Process training stats
    const maxTrainingLevels = new Map<string, number>();
    trainingStats.forEach(stat => {
        const currentMax = maxTrainingLevels.get(stat.configuracionEntrenamientoId) || 0;
        if (stat.nivel > currentMax) {
            maxTrainingLevels.set(stat.configuracionEntrenamientoId, stat.nivel);
        }
    });
    const currentUserTrainingLevels = new Map(currentUser.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));
    
    const trainingStatData = allTrainingConfigs.map(config => ([
        config.nombre,
        currentUserTrainingLevels.get(config.id) || 0,
        maxTrainingLevels.get(config.id) || 0,
    ]));

    // Process troop stats
    const maxTroopCounts = new Map<string, number>();
    troopStats.forEach(stat => {
        const currentMax = maxTroopCounts.get(stat.configuracionTropaId) || 0;
        if (stat.total > currentMax) {
            maxTroopCounts.set(stat.configuracionTropaId, stat.total);
        }
    });

    const currentUserTroopCounts = new Map<string, number>();
    troopStats.filter(t => t.userId === currentUser.id).forEach(t => {
        currentUserTroopCounts.set(t.configuracionTropaId, t.total);
    });

    const troopStatData = allTroopConfigs.map(config => ([
        config.nombre,
        currentUserTroopCounts.get(config.id) || 0,
        maxTroopCounts.get(config.id) || 0,
    ]));

    const chartData = resourceStats.map(stat => ({
        name: stat.name,
        Capacidad: stat.maxValue,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Estadísticas Globales</h2>
                    <p className="text-muted-foreground">
                        Compara tu progreso con los mejores jugadores del servidor.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="animate-fade-in-up">
                    <CardHeader>
                         <CardTitle className="font-heading text-xl tracking-wider text-primary">CAPACIDAD MÁXIMA DE ALMACENAMIENTO</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}K`} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        borderColor: "hsl(var(--border))",
                                        color: "hsl(var(--foreground))"
                                    }}
                                />
                                <Bar dataKey="Capacidad" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <StatTableCard title="ESTADÍSTICAS DE HABITACIONES" headers={['Habitación', 'Mi Nivel', 'Nivel Máximo']} data={roomStatData} hasProgress />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <StatTableCard title="ESTADÍSTICAS DE ENTRENAMIENTOS" headers={['Entrenamiento', 'Mi Nivel', 'Nivel Máximo']} data={trainingStatData} hasProgress />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <StatTableCard title="ESTADÍSTICAS DE TROPAS" headers={['Tropa', 'Mis Unidades', 'Unidades Máximas']} data={troopStatData} hasProgress />
                </div>
            </div>
        </div>
    );
}
