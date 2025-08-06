
'use client'

import { useState, useMemo } from "react";
import { calcularProduccionTotalPorSegundo } from "@/lib/formulas/room-formulas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import type { UserWithProgress, FullPropiedad } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resourceIcons } from "@/lib/constants";


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
    return `${sign}${formatNumber(num)}/h`;
}

interface ResourcesViewProps {
    user: UserWithProgress;
}

function ResourceCard({ resourceKey, name, icon, productionPerHour }: { resourceKey: string, name: string, icon: string, productionPerHour: number }) {
    
    const projectionData = useMemo(() => {
        return [
            { interval: "1 Hora", gain: productionPerHour },
            { interval: "8 Horas", gain: productionPerHour * 8 },
            { interval: "1 Día", gain: productionPerHour * 24 },
            { interval: "1 Semana", gain: productionPerHour * 24 * 7 },
        ];
    }, [productionPerHour]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Image src={icon} alt={name} width={32} height={32} />
                    <CardTitle>{name}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className={`text-3xl font-bold font-mono ${productionPerHour >= 0 ? 'text-green-400' : 'text-destructive'}`}>{formatProduction(productionPerHour)}</p>
                
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Intervalo</TableHead>
                            <TableHead className="text-right">Ganancia Proyectada</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projectionData.map(item => (
                            <TableRow key={item.interval}>
                                <TableCell className="font-medium">{item.interval}</TableCell>
                                <TableCell className={`text-right font-mono ${item.gain >= 0 ? 'text-green-500/90' : 'text-destructive/90'}`}>
                                    {item.gain >= 0 ? '+' : ''}{formatNumber(item.gain)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export function ResourcesView({ user }: ResourcesViewProps) {
    const [selectedPropertyId, setSelectedPropertyId] = useState('all');

    const productionData = useMemo(() => {
        const propertiesToCalc = selectedPropertyId === 'all' 
            ? user.propiedades
            : user.propiedades.filter((p: FullPropiedad) => p.id === selectedPropertyId);
        
        const totals = propertiesToCalc.reduce((acc, propiedad) => {
            const prod = calcularProduccionTotalPorSegundo(propiedad);
            acc.armas += prod.armas.produccionNeta * 3600;
            acc.municion += prod.municion.produccionNeta * 3600;
            acc.alcohol += prod.alcohol.produccionNeta * 3600;
            acc.dolares += prod.dolares.produccionNeta * 3600;
            return acc;
        }, { armas: 0, municion: 0, alcohol: 0, dolares: 0 });

        return Object.keys(totals).map(key => ({
            key,
            name: resourceNames[key],
            icon: resourceIcons[key],
            perHour: totals[key as keyof typeof totals],
        }));

    }, [user.propiedades, selectedPropertyId]);

    return (
        <div className="space-y-4 mt-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productionData.map((res, index) => (
                    <div key={res.key} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                        <ResourceCard
                            resourceKey={res.key}
                            name={res.name}
                            icon={res.icon}
                            productionPerHour={res.perHour}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
