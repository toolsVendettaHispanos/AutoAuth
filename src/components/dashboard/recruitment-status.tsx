
'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FullColaReclutamiento } from "@/lib/types";

type RecruitmentStatusProps = {
    recruitments: (FullColaReclutamiento & { propiedadNombre: string })[];
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

            if (difference <= 0) {
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

export function RecruitmentStatus({ recruitments }: RecruitmentStatusProps) {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <div className="bg-card text-card-foreground px-4 py-3 rounded-b-md space-y-2">
            {recruitments.length > 0 ? (
                 recruitments.map(queueItem => (
                    <CountdownTimer 
                        key={queueItem.id}
                        label={`${queueItem.propiedadNombre}: ${queueItem.cantidad} x ${queueItem.tropaConfig.nombre}`}
                        endDate={new Date(queueItem.fechaFinalizacion).toISOString()}
                        onFinish={handleRefresh}
                     />
                ))
            ) : (
                <p className="text-muted-foreground text-center text-sm">No hay reclutamientos en cola.</p>
            )}
        </div>
    );
}
