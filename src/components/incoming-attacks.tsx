
'use client'

import type { IncomingAttack } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Swords, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type IncomingAttacksProps = {
    attacks: IncomingAttack[];
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

function CountdownTimer({ label, endDate, onFinish }: {label: string, endDate: string | Date, onFinish: () => void}) {
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
        <div className="flex justify-between items-center text-sm">
            <span>{label}</span>
            <span className="font-mono text-destructive">{timeLeft}</span>
        </div>
    );
}

export function IncomingAttacks({ attacks }: IncomingAttacksProps) {
    const router = useRouter();

    if (!attacks || attacks.length === 0) {
        return null;
    }

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <Card className="border-destructive/50">
            <CardHeader className="flex-row items-center space-x-3 space-y-0 p-4 bg-destructive/20 text-destructive-foreground">
                <Swords className="h-6 w-6 text-destructive"/>
                <CardTitle className="font-heading tracking-wider">ATAQUES ENTRANTES ({attacks.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                 <div className="bg-card text-card-foreground px-4 py-3 rounded-b-md space-y-2">
                    {attacks.map(attack => (
                        <div key={attack.id} className="text-sm">
                           <div className="flex justify-between items-center">
                                <span>{attack.attackerName} &rarr; {attack.targetProperty}</span>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-muted-foreground"/>
                                    <span className="font-mono">{attack.totalTroops}</span>
                                </div>
                           </div>
                           <CountdownTimer 
                                label="Tiempo de llegada:"
                                endDate={attack.arrivalTime}
                                onFinish={handleRefresh}
                           />
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
}
