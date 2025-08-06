

'use client'

import { Card, CardContent } from "@/components/ui/card"
import { iniciarAmpliacion } from "@/lib/actions/room.actions"
import { ConstructionQueue } from "./construction-queue"
import { useEffect, useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useProperty } from "@/contexts/property-context"
import { calcularCostosNivel, calcularTiempoConstruccion } from "@/lib/formulas/room-formulas"
import type { FullConfiguracionHabitacion, UserWithProgress, FullPropiedad } from "@/lib/types"
import { ID_OFICINA_JEFE, MAX_CONSTRUCTION_QUEUE_SIZE, ROOM_ORDER } from "@/lib/constants"
import { RoomCard } from "./room-card"

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

        const construccionEnCola = selectedProperty.colaConstruccion.filter(c => c.fechaFinalizacion);
        if (construccionEnCola.length === 0) return;

        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const newTimers: Record<string, number> = {};
            let needsRefresh = false;

            construccionEnCola.forEach(item => {
                const endTime = new Date(item.fechaFinalizacion!).getTime();
                const newTimeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
                newTimers[item.id] = newTimeLeft;
                if (newTimeLeft === 0) {
                    needsRefresh = true;
                }
            });

            setTimers(newTimers);

            if (needsRefresh) {
                router.refresh();
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [selectedProperty, router]);

    const roomsData = useMemo(() => {
        if (!selectedProperty) return [];

        const userRoomsMap = new Map(selectedProperty.habitaciones.map(h => [h.configuracionHabitacionId, h]));
        const construccionEnCola = selectedProperty.colaConstruccion;
        const nivelOficinaJefe = userRoomsMap.get(ID_OFICINA_JEFE)?.nivel || 1;

        return ROOM_ORDER.map(id => {
            const config = allRoomConfigs.find(c => c.id === id);
            if (!config) return null;

            const userRoom = userRoomsMap.get(id);
            const nivelBase = userRoom ? userRoom.nivel : 0;
            const mejorasEnCola = construccionEnCola.filter(c => c.habitacionId === id);
            const nivelProyectado = nivelBase + mejorasEnCola.length;
            const nivelSiguiente = nivelProyectado + 1;

            const costosSiguienteNivel = calcularCostosNivel(nivelSiguiente, config);
            const tiempoSiguienteNivel = calcularTiempoConstruccion(nivelSiguiente, config, nivelOficinaJefe);

            const requirements = config.requisitos || [];
            const meetsRequirements = requirements.every(req => (userRoomsMap.get(req.requiredRoomId)?.nivel || 0) >= req.requiredLevel);
            const requirementsText = !meetsRequirements
                ? requirements.map(req => `${allRoomConfigs.find(r => r.id === req.requiredRoomId)?.nombre || req.requiredRoomId} (Nvl ${req.requiredLevel})`).join(', ')
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

    }, [selectedProperty, allRoomConfigs]);

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
        setIsSubmitting(null); // Reset submitting state
    }

    const simpleRoomConfigs = allRoomConfigs.map(r => ({ id: r.id, nombre: r.nombre, urlImagen: r.urlImagen }));
    const isQueueFull = selectedProperty.colaConstruccion.length >= MAX_CONSTRUCTION_QUEUE_SIZE;

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
                {roomsData.map((room, index) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        timeLeft={room.construccionActiva ? timers[room.construccionActiva.id] : undefined}
                        isQueueFull={isQueueFull}
                        isSubmitting={isSubmitting === room.id}
                        onUpgrade={handleAmpliacion}
                        index={index}
                    />
                ))}
            </div>
        </div>
    )
}
