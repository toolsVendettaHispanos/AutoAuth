
'use client';

import type { ColaConstruccion } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ConstructionStatusProps = {
    constructions: (ColaConstruccion & { propiedadNombre: string })[];
    allRooms: { id: string; nombre: string; }[];
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

function CountdownTimer({ label, endDate, onFinish }: {label: string, endDate: string, onFinish: () => void}) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const end = new Date(endDate).getTime();
        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const difference = Math.floor((end - now) / 1000);

            if (difference < -1) { // 1 second grace period
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
        <div className="flex justify-between items-center text-sm">
            <span>{label}</span>
            <span className="font-mono text-accent">{timeLeft}</span>
        </div>
    );
}

export function ConstructionStatus({ constructions, allRooms }: ConstructionStatusProps) {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <div className="bg-card text-card-foreground px-4 py-3 rounded-b-md space-y-2">
            {constructions.length > 0 ? (
                constructions.map(queueItem => {
                    const room = allRooms.find(r => r.id === queueItem.habitacionId);
                    if (!room || !queueItem.fechaFinalizacion) return null;
                    return (
                         <CountdownTimer 
                            key={queueItem.id}
                            label={`${queueItem.propiedadNombre}: ${room.nombre} (Nvl ${queueItem.nivelDestino})`}
                            endDate={new Date(queueItem.fechaFinalizacion).toISOString()}
                            onFinish={handleRefresh}
                         />
                    )
                })
            ) : (
                <p className="text-muted-foreground text-center text-sm">No hay construcciones en cola.</p>
            )}
        </div>
    );
}
