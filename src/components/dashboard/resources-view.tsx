
'use client';

import { useState, useMemo } from "react";
import { calculateStorageCapacity, calculateSafeStorage, calcularProduccionTotalPorSegundo } from "@/lib/formulas/room-formulas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import type { UserWithProgress, FullPropiedad } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resourceIcons } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

const resourceNames: { [key: string]: string } = {
    armas: "Armas",
    municion: "Munición",
    alcohol: "Alcohol",
    dolares: "Dólares",
};

function formatNumber(num: number): string {
    return Math.floor(num).toLocaleString('de-DE');
}

function formatProduction(num: number): string {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${formatNumber(num)}`;
}

interface ResourcesViewProps {
    user: UserWithProgress;
}

export function ResourcesView({ user }: ResourcesViewProps) {
    const [selectedPropertyId, setSelectedPropertyId] = useState('all');

    const productionData = useMemo(() => {
        const propertiesToCalc = selectedPropertyId === 'all' 
            ? user.propiedades
            : user.propiedades.filter((p: FullPropiedad) => p.id === selectedPropertyId);
        
        return propertiesToCalc.reduce((acc, propiedad) => {
            const prod = calcularProduccionTotalPorSegundo(propiedad);
            acc.armas += prod.armas.produccionNeta;
            acc.municion += prod.municion.produccionNeta;
            acc.alcohol += prod.alcohol.produccionNeta;
            acc.dolares += prod.dolares.produccionNeta;
            return acc;
        }, { armas: 0, municion: 0, alcohol: 0, dolares: 0 });

    }, [user.propiedades, selectedPropertyId]);

    const storageAndResourceData = useMemo(() => {
        const propertiesToCalc = selectedPropertyId === 'all'
            ? user.propiedades
            : user.propiedades.filter((p: FullPropiedad) => p.id === selectedPropertyId);

        if (propertiesToCalc.length === 0) {
            return {
                armas: { capacidad: 0, seguro: 0, actual: 0 },
                municion: { capacidad: 0, seguro: 0, actual: 0 },
                alcohol: { capacidad: 0, seguro: 0, actual: 0 },
                dolares: { capacidad: 0, seguro: 0, actual: 0 }
            };
        }

        return propertiesToCalc.reduce((acc, prop) => {
            const capacity = calculateStorageCapacity(prop);
            const safe = calculateSafeStorage(prop);
            acc.armas.capacidad += capacity.armas;
            acc.armas.seguro += safe.armas;
            acc.armas.actual += Number(prop.armas);
            acc.municion.capacidad += capacity.municion;
            acc.municion.seguro += safe.municion;
            acc.municion.actual += Number(prop.municion);
            acc.alcohol.capacidad += capacity.alcohol;
            acc.alcohol.seguro += safe.alcohol;
            acc.alcohol.actual += Number(prop.alcohol);
            acc.dolares.capacidad += capacity.dolares;
            acc.dolares.seguro += safe.dolares;
            acc.dolares.actual += Number(prop.dolares);
            return acc;
        }, {
            armas: { capacidad: 0, seguro: 0, actual: 0 },
            municion: { capacidad: 0, seguro: 0, actual: 0 },
            alcohol: { capacidad: 0, seguro: 0, actual: 0 },
            dolares: { capacidad: 0, seguro: 0, actual: 0 }
        });
    }, [user.propiedades, selectedPropertyId]);

    const productionTableHeaders = ["Recurso", "Por Hora", "Por Día", "Por Semana"];
    
    const storageCards = [
        { title: "Almacén de Armas", resourceKey: "armas" },
        { title: "Depósito", resourceKey: "municion" },
        { title: "Almacén de Alcohol", resourceKey: "alcohol" },
        { title: "Caja Fuerte", resourceKey: "dolares" },
    ];

    return (
        <div className="space-y-4 mt-4 animate-fade-in">
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Filtrar por propiedad..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las propiedades</SelectItem>
                    {user.propiedades.map((prop: FullPropiedad) => (
                        <SelectItem key={prop.id} value={prop.id}>{prop.nombre}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen de Producción</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {productionTableHeaders.map(header => (
                                        <TableHead key={header} className={header !== "Recurso" ? "text-right" : ""}>{header}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.keys(resourceNames).map(key => {
                                    const valuePerHour = productionData[key as keyof typeof productionData];
                                    return (
                                    <TableRow key={key}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Image src={resourceIcons[key]} alt={resourceNames[key]} width={20} height={20} />
                                            {resourceNames[key]}
                                        </TableCell>
                                        <TableCell className={cn("text-right font-mono", valuePerHour >= 0 ? 'text-green-400' : 'text-destructive')}>
                                            {formatProduction(valuePerHour)}
                                        </TableCell>
                                        <TableCell className={cn("text-right font-mono", (valuePerHour * 24) >= 0 ? 'text-green-400' : 'text-destructive')}>
                                            {formatProduction(valuePerHour * 24)}
                                        </TableCell>
                                        <TableCell className={cn("text-right font-mono", (valuePerHour * 24 * 7) >= 0 ? 'text-green-400' : 'text-destructive')}>
                                            {formatProduction(valuePerHour * 24 * 7)}
                                        </TableCell>
                                    </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {storageCards.map((card, index) => {
                     const data = storageAndResourceData[card.resourceKey as keyof typeof storageAndResourceData];
                     const progress = data.capacidad > 0 ? (data.actual / data.capacidad) * 100 : 0;
                     return (
                        <Card key={card.title} className="animate-fade-in-up relative overflow-hidden" style={{ animationDelay: `${index * 100}ms`}}>
                             <CardHeader className="flex-row items-center gap-3">
                                <Image src={resourceIcons[card.resourceKey]} alt={card.title} width={32} height={32} />
                                <CardTitle>{card.title}</CardTitle>
                             </CardHeader>
                            <CardContent className="space-y-3">
                                <Progress value={progress} className="h-3" indicatorClassName="bg-primary/80" />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-muted-foreground text-sm">Capacidad:</span>
                                    <span className="font-bold text-lg font-mono">{formatNumber(data.capacidad)}</span>
                                </div>
                                 <div className="flex justify-between items-baseline">
                                    <span className="text-muted-foreground text-sm">Seguro:</span>
                                    <span className="font-bold text-lg font-mono">{formatNumber(data.seguro)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-muted-foreground text-sm">Actual:</span>
                                    <span className="font-bold text-lg font-mono text-primary">{formatNumber(data.actual)}</span>
                                </div>
                            </CardContent>
                        </Card>
                     )
                 })}
            </div>
        </div>
    );
}
