
'use client';

import { useMemo, useState } from "react";
import type { FullPropiedad, UserWithProgress } from "@/lib/types";
import { calcularProduccionTotalPorSegundo } from "@/lib/formulas/room-formulas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Building, Users, Box, Factory, DollarSign, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { resourceIcons, RECRUITMENT_TROOP_ORDER, SECURITY_TROOP_ORDER } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface GlobalVisionViewProps {
    user: UserWithProgress;
}

function formatNumber(num: number): string {
    if (num === null || num === undefined) return "0";
    return Math.floor(num).toLocaleString('de-DE');
}

export function GlobalVisionView({ user }: GlobalVisionViewProps) {
    const isMobile = useIsMobile();
    const [openAccordions, setOpenAccordions] = useState<string[]>(['resources', 'production']);

    const { propertiesData, empireTotals, troopNames } = useMemo(() => {
        const troopNamesMap = new Map<string, string>();
        
        const propertiesData = user.propiedades.map(prop => {
            const production = calcularProduccionTotalPorSegundo(prop);
            const troops = new Map<string, number>();
            [...prop.TropaUsuario, ...prop.TropaSeguridadUsuario].forEach(t => {
                if (!troopNamesMap.has(t.configuracionTropa.id)) {
                    troopNamesMap.set(t.configuracionTropa.id, t.configuracionTropa.nombre);
                }
                troops.set(t.configuracionTropa.id, (troops.get(t.configuracionTropa.id) || 0) + t.cantidad);
            });

            return {
                id: prop.id,
                nombre: prop.nombre,
                coords: `[${prop.ciudad}:${prop.barrio}:${prop.edificio}]`,
                resources: {
                    armas: Number(prop.armas),
                    municion: Number(prop.municion),
                    alcohol: Number(prop.alcohol),
                    dolares: Number(prop.dolares),
                },
                production: {
                    armas: production.armas.produccionNeta * 3600,
                    municion: production.municion.produccionNeta * 3600,
                    alcohol: production.alcohol.produccionNeta * 3600,
                    dolares: production.dolares.produccionNeta * 3600,
                },
                troops,
            };
        });

        const empireTotals = propertiesData.reduce((acc, prop) => {
            acc.resources.armas += prop.resources.armas;
            acc.resources.municion += prop.resources.municion;
            acc.resources.alcohol += prop.resources.alcohol;
            acc.resources.dolares += prop.resources.dolares;

            acc.production.armas += prop.production.armas;
            acc.production.municion += prop.production.municion;
            acc.production.alcohol += prop.production.alcohol;
            acc.production.dolares += prop.production.dolares;

            prop.troops.forEach((count, id) => {
                acc.troops.set(id, (acc.troops.get(id) || 0) + count);
            });

            return acc;
        }, {
            resources: { armas: 0, municion: 0, alcohol: 0, dolares: 0 },
            production: { armas: 0, municion: 0, alcohol: 0, dolares: 0 },
            troops: new Map<string, number>(),
        });
        
        return { propertiesData, empireTotals, troopNames: troopNamesMap };

    }, [user.propiedades]);
    
    const allTroopIds = RECRUITMENT_TROOP_ORDER.concat(SECURITY_TROOP_ORDER);

    const metricRows = [
        { type: 'header', label: 'Recursos' },
        { type: 'data', label: "Armas", resourceKey: 'armas', isProduction: false },
        { type: 'data', label: "Municion", resourceKey: 'municion', isProduction: false },
        { type: 'data', label: "Alcohol", resourceKey: 'alcohol', isProduction: false },
        { type: 'data', label: "Dolares", resourceKey: 'dolares', isProduction: false },
        { type: 'header', label: 'Producción/h' },
        { type: 'data', label: "Armas/h", resourceKey: 'armas', isProduction: true },
        { type: 'data', label: "Municion/h", resourceKey: 'municion', isProduction: true },
        { type: 'data', label: "Alcohol/h", resourceKey: 'alcohol', isProduction: true },
        { type: 'data', label: "Dolares/h", resourceKey: 'dolares', isProduction: true },
        { type: 'header', label: 'Tropas' },
        ...allTroopIds.map(id => ({ type: 'troop' as const, label: troopNames.get(id) || id, troopId: id }))
    ];


    const renderDesktopTable = () => (
         <Card>
            <CardContent className="p-0">
                <ScrollArea className="w-full whitespace-nowrap h-[75vh]">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-background/95 z-10 w-[180px]">Métrica</TableHead>
                                {propertiesData.map(prop => (
                                    <TableHead key={prop.id} className="text-center">{prop.nombre}<br/><span className="text-xs text-muted-foreground">{prop.coords}</span></TableHead>
                                ))}
                                <TableHead className="text-center font-bold text-primary">Total Imperio</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metricRows.map((row, index) => {
                                if(row.type === 'header') {
                                    return <TableRow key={row.label}><TableCell colSpan={propertiesData.length + 2} className="h-2 bg-muted/50 p-1 font-bold text-center text-primary">{row.label}</TableCell></TableRow>
                                }
                                if(row.type === 'troop' && !empireTotals.troops.has(row.troopId)) return null;

                                return (
                                 <TableRow key={row.label} className="even:bg-muted/20">
                                    <TableCell className="sticky left-0 bg-background/95 font-semibold">{row.label}</TableCell>
                                    {propertiesData.map(prop => {
                                        const value = row.type === 'data' 
                                            ? (row.isProduction ? prop.production[row.resourceKey as keyof typeof prop.production] : prop.resources[row.resourceKey as keyof typeof prop.resources])
                                            : (prop.troops.get(row.troopId) || 0);
                                        const isPositive = row.isProduction && value > 0;
                                        return (
                                            <TableCell key={prop.id} className={cn("text-center font-mono", isPositive ? 'text-green-400' : 'text-foreground')}>
                                                {isPositive && '+'}{formatNumber(value)}
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell className="text-center font-mono font-bold text-primary">
                                       {(() => {
                                            const totalValue = row.type === 'data' 
                                                ? (row.isProduction ? empireTotals.production[row.resourceKey as keyof typeof empireTotals.production] : empireTotals.resources[row.resourceKey as keyof typeof empireTotals.resources])
                                                : (empireTotals.troops.get(row.troopId) || 0);
                                            const isTotalPositive = row.isProduction && totalValue > 0;
                                            return <span className={cn(isTotalPositive ? 'text-green-400' : 'text-primary')}>{isTotalPositive && '+'}{formatNumber(totalValue)}</span>
                                        })()}
                                    </TableCell>
                                </TableRow>
                               )
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );

     const renderMobileCards = () => (
        <div className="space-y-4">
             <Card className="animate-fade-in-up">
                <CardHeader>
                    <CardTitle className="text-2xl font-heading tracking-wider text-primary">Resumen del Imperio</CardTitle>
                </CardHeader>
                <CardContent>
                     <Accordion type="multiple" defaultValue={['resources', 'production']} className="w-full">
                         <AccordionItem value="resources">
                            <AccordionTrigger>Recursos Totales</AccordionTrigger>
                            <AccordionContent className="grid grid-cols-2 gap-4 pt-2">
                                {Object.entries(empireTotals.resources).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <Image src={resourceIcons[key]} alt={key} width={24} height={24} />
                                        <div>
                                            <p className="text-xs capitalize text-muted-foreground">{key}</p>
                                            <p className="font-bold text-lg">{formatNumber(value)}</p>
                                        </div>
                                    </div>
                                ))}
                            </AccordionContent>
                         </AccordionItem>
                          <AccordionItem value="production">
                            <AccordionTrigger>Producción Total</AccordionTrigger>
                            <AccordionContent className="grid grid-cols-2 gap-4 pt-2">
                                 {Object.entries(empireTotals.production).map(([key, value]) => (
                                    <p key={key} className="flex items-center gap-2 font-mono text-green-400">
                                        <Image src={resourceIcons[key]} alt={key} width={20} height={20} />
                                        +{formatNumber(value)}/h
                                    </p>
                                ))}
                            </AccordionContent>
                         </AccordionItem>
                          <AccordionItem value="troops">
                            <AccordionTrigger>Ejército Total</AccordionTrigger>
                            <AccordionContent className="space-y-2 pt-2 text-sm">
                                {allTroopIds.map(id => {
                                    const count = empireTotals.troops.get(id) || 0;
                                    if(count === 0) return null;
                                    return (
                                        <div key={id} className="flex justify-between">
                                            <span>{troopNames.get(id) || id}</span>
                                            <span className="font-bold">{formatNumber(count)}</span>
                                        </div>
                                    )
                                })}
                            </AccordionContent>
                         </AccordionItem>
                     </Accordion>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Visión Global del Imperio</h2>
                    <p className="text-muted-foreground">Resumen de todas tus operaciones y propiedades.</p>
                </div>
                 <Button asChild variant="outline" size="sm">
                    <Link href="/overview">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
            </div>

            {isMobile ? renderMobileCards() : renderDesktopTable()}
            
        </div>
    );
}

