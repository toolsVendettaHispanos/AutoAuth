

'use client'

import { LiveClock } from "./live-clock";
import type { UserWithProgress } from '@/lib/types';
import { useProperty } from '@/contexts/property-context';
import Image from "next/image";
import { calculateStorageCapacity, calcularProduccionTotalPorSegundo, ProductionData } from "@/lib/formulas/room-formulas";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";

const resourceIcons: { [key: string]: string } = {
    armas: '/img/recursos/armas.svg',
    municion: '/img/recursos/municion.svg',
    alcohol: '/img/recursos/alcohol.svg',
    dolares: '/img/recursos/dolares.svg',
};

function AnimatedNumber({ value }: { value: number }) {
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        const diff = value - currentValue;
        if (Math.abs(diff) < 1) {
            setCurrentValue(value);
            return;
        }

        let start: number | null = null;
        const duration = 1000; // ms

        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            const nextValue = currentValue + diff * percentage;
            
            if (progress < duration) {
                setCurrentValue(nextValue);
                requestAnimationFrame(step);
            } else {
                 setCurrentValue(value); // Ensure it ends on the exact value
            }
        };

        requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return <span>{Math.floor(currentValue).toLocaleString('de-DE')}</span>;
}


function formatNumber(num: number | bigint | undefined) {
    if (typeof num === 'undefined') return '0';
    const numberValue = Number(num);
    return Math.floor(numberValue).toLocaleString('de-DE');
}

function formatDuration(totalSeconds: number): string {
    if (totalSeconds <= 0 || !isFinite(totalSeconds)) return "∞";
    
    const d = Math.floor(totalSeconds / (3600*24));
    const h = Math.floor(totalSeconds % (3600*24) / 3600);
    const m = Math.floor(totalSeconds % 3600 / 60);

    let result = '';
    if (d > 0) result += `${d}d `;
    if (h > 0) result += `${h}h `;
    if (m > 0 && d === 0) result += `${m}m`; // Only show minutes if days are not shown
    
    return result.trim() || "< 1m";
}

interface ResourceBarProps {
    user: UserWithProgress | null;
}

const ResourceTooltipContent = ({ resource, capacity, production, safeStorage }: { resource: any, capacity: number, production: ProductionData, safeStorage: number }) => {
    const timeToFill = production.produccionNeta > 0 ? (capacity - Number(resource.value)) / (production.produccionNeta / 3600) : Infinity;

    return (
        <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Producción:</span>
                <span className="font-mono text-green-400">+{formatNumber(production.produccionBruta)}/h</span>
            </div>
             {production.consumoTotal > 0 && (
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Consumo:</span>
                    <span className="font-mono text-destructive">-{formatNumber(production.consumoTotal)}/h</span>
                </div>
            )}
             {production.consumoTotal > 0 && (
                 <>
                    <Separator className="my-1"/>
                     <div className="flex justify-between items-center font-bold">
                        <span>Balance final:</span>
                        <span className={`font-mono ${production.produccionNeta >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                            {production.produccionNeta >= 0 ? '+' : ''}{formatNumber(production.produccionNeta)}/h
                        </span>
                    </div>
                 </>
             )}
            <Separator className="my-2"/>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Almacenamiento:</span>
                <span className="font-mono">{formatNumber(capacity)}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Seguro:</span>
                <span className="font-mono">{formatNumber(safeStorage)}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tiempo hasta llenar:</span>
                <span className="font-mono">{formatDuration(timeToFill)}</span>
            </div>
        </div>
    )
}

export function ResourceBar({ user }: ResourceBarProps) {
    const { selectedProperty } = useProperty();
    const isMobile = useIsMobile();

    if (!user || !selectedProperty) {
        return (
            <div className="w-full bg-black/50 backdrop-blur-md text-white p-2">
                <div className="container mx-auto flex items-center justify-center">
                    <p>Selecciona una propiedad para ver tus recursos.</p>
                </div>
            </div>
        );
    }

    const capacity = calculateStorageCapacity(selectedProperty);
    const production = calcularProduccionTotalPorSegundo(selectedProperty);

    const resources = [
        { name: 'ARMAS', key: 'armas', value: selectedProperty.armas, icon: resourceIcons.armas, capacity: capacity.armas, production: production.armas, safe: Math.floor(capacity.armas * 0.1) },
        { name: 'MUNICION', key: 'municion', value: selectedProperty.municion, icon: resourceIcons.municion, capacity: capacity.municion, production: production.municion, safe: Math.floor(capacity.municion * 0.1) },
        { name: 'ALCOHOL', key: 'alcohol', value: selectedProperty.alcohol, icon: resourceIcons.alcohol, capacity: capacity.alcohol, production: production.alcohol, safe: Math.floor(capacity.alcohol * 0.1) },
        { name: 'DOLARES', key: 'dolares', value: selectedProperty.dolares, icon: resourceIcons.dolares, capacity: capacity.dolares, production: production.dolares, safe: Math.floor(capacity.dolares * 0.1) },
    ];

    return (
        <header className="w-full bg-black/50 backdrop-blur-md text-white shadow-md z-20 border-b border-white/10" suppressHydrationWarning>
            <div className="container mx-auto flex h-full items-center justify-between p-2">
                <div className="grid grid-cols-2 md:grid-cols-4 items-center justify-around gap-x-4 gap-y-2 w-full">
                    {resources.map((res) => {
                         const resourceName = res.name.charAt(0) + res.name.slice(1).toLowerCase();
                         const percentage = res.capacity > 0 ? (Number(res.value) / res.capacity) * 100 : 0;
                         const progressColor = percentage > 95 ? "bg-red-600" : percentage > 80 ? "bg-yellow-500" : "bg-primary";
                         
                         const trigger = (
                             <div className="flex flex-col items-center gap-0.5 w-full">
                                <div className="flex items-center gap-2">
                                     <Image src={res.icon} alt={res.name} width={16} height={16} className="h-4 w-4" />
                                     <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{res.name}</span>
                                 </div>
                                <span className="text-xl font-bold tabular-nums text-foreground font-mono">
                                     <AnimatedNumber value={Number(res.value)} />
                                </span>
                                <Progress value={percentage} className="h-1 mt-1 bg-muted/50" indicatorClassName={progressColor} />
                             </div>
                        );

                        if(isMobile) {
                            return (
                                <Dialog key={res.name}>
                                    <DialogTrigger asChild>
                                        {trigger}
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Detalles de {resourceName}</DialogTitle>
                                        </DialogHeader>
                                        <ResourceTooltipContent resource={res} capacity={res.capacity} production={res.production} safeStorage={res.safe} />
                                         <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" variant="secondary">Cerrar</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )
                        }

                        return (
                            <TooltipProvider key={res.name} delayDuration={0}>
                                 <Tooltip>
                                    <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                                    <TooltipContent>
                                        <div className="p-2 space-y-2">
                                            <h3 className="font-bold text-lg text-primary">{resourceName}</h3>
                                            <Separator />
                                            <ResourceTooltipContent resource={res} capacity={res.capacity} production={res.production} safeStorage={res.safe} />
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </div>
                <div className="hidden lg:flex">
                     <LiveClock />
                </div>
            </div>
        </header>
    );
}
