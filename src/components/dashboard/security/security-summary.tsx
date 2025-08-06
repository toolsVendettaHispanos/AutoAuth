
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Ammo } from "lucide-react";
import { useState, useEffect } from "react";

interface SecuritySummaryProps {
    totalDefensePower: number;
    munitionConsumption: number;
}

function AnimatedNumber({ value }: { value: number }) {
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        const diff = value - currentValue;
        if (Math.abs(diff) < 1 && value !== 0) {
            setCurrentValue(value);
            return;
        }

        let start: number | null = null;
        const duration = 1000;

        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            const nextValue = currentValue + diff * percentage;
            
            if (progress < duration) {
                setCurrentValue(nextValue);
                requestAnimationFrame(step);
            } else {
                 setCurrentValue(value);
            }
        };

        requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return <span>{Math.floor(currentValue).toLocaleString('de-DE')}</span>;
}


export function SecuritySummary({ totalDefensePower, munitionConsumption }: SecuritySummaryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="animate-fade-in-up">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Poder Defensivo Total</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">
                        <AnimatedNumber value={totalDefensePower} />
                    </div>
                    <p className="text-xs text-muted-foreground">Suma de la defensa de todas las unidades asignadas.</p>
                </CardContent>
            </Card>
             <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bonus de Muros</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                       +0%
                    </div>
                    <p className="text-xs text-muted-foreground">Bonus por nivel de edificios defensivos (Próximamente).</p>
                </CardContent>
            </Card>
             <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Consumo de Munición</CardTitle>
                    <Ammo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        <AnimatedNumber value={munitionConsumption} /> /h
                    </div>
                    <p className="text-xs text-muted-foreground">Coste de mantenimiento por hora de las tropas asignadas.</p>
                </CardContent>
            </Card>
        </div>
    );
}
