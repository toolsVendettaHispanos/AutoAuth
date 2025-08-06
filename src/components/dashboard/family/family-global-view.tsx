
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FullFamily } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Crown, Shield, User as UserIcon } from "lucide-react";
import { FamilyRole } from "@prisma/client";
import { calcularProduccionTotalPorSegundo } from "@/lib/formulas/room-formulas";
import { TRAINING_ORDER, RECRUITMENT_TROOP_ORDER, SECURITY_TROOP_ORDER } from "@/lib/constants";
import { useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FamilyGlobalViewProps {
    family: FullFamily;
}

const roleIcons: Record<FamilyRole, React.ReactNode> = {
    [FamilyRole.LEADER]: <Crown className="h-4 w-4 text-amber-400" />,
    [FamilyRole.CO_LEADER]: <Shield className="h-4 w-4 text-blue-400" />,
    [FamilyRole.MEMBER]: <UserIcon className="h-4 w-4 text-muted-foreground" />,
}

function formatNumber(num: number | bigint): string {
  if (num === null || num === undefined) return "0";
  return Number(num).toLocaleString('de-DE');
}

export function FamilyGlobalView({ family }: FamilyGlobalViewProps) {
    const isMobile = useIsMobile();
    const [openAccordions, setOpenAccordions] = useState<string[]>(['puntos']);
    
    const membersData = useMemo(() => {
        return family.members.map(member => {
            const production = member.user.propiedades.reduce((acc, p) => {
                const prod = calcularProduccionTotalPorSegundo(p);
                acc.armas += prod.armas.produccionNeta;
                acc.municion += prod.municion.produccionNeta;
                acc.alcohol += prod.alcohol.produccionNeta;
                acc.dolares += prod.dolares.produccionNeta;
                return acc;
            }, { armas: 0, municion: 0, alcohol: 0, dolares: 0 });

            const roomLevels = new Map<string, number>();
            member.user.propiedades.forEach(p => {
                p.habitaciones.forEach(h => {
                    const currentLevel = roomLevels.get(h.configuracionHabitacionId) || 0;
                    if (h.nivel > currentLevel) {
                        roomLevels.set(h.configuracionHabitacionId, h.nivel);
                    }
                });
            });

            const trainingLevels = new Map(member.user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));
            
            const troops = new Map<string, number>();
             member.user.propiedades.forEach(p => {
                [...p.TropaUsuario, ...p.TropaSeguridadUsuario].forEach(t => {
                    troops.set(t.configuracionTropaId, (troops.get(t.configuracionTropaId) || 0) + t.cantidad);
                })
            });

            return {
                ...member,
                production: {
                    armas: production.armas,
                    municion: production.municion,
                    alcohol: production.alcohol,
                    dolares: production.dolares,
                },
                roomLevels,
                trainingLevels,
                troops,
                totalResources: member.user.propiedades.reduce((acc, p) => {
                    acc.armas += Number(p.armas);
                    acc.municion += Number(p.municion);
                    acc.alcohol += Number(p.alcohol);
                    acc.dolares += Number(p.dolares);
                    return acc;
                }, { armas: 0, municion: 0, alcohol: 0, dolares: 0 }),
            }
        });
    }, [family.members]);
    
    type MemberData = (typeof membersData)[0];


    const familyTotals = useMemo(() => {
        return membersData.reduce((acc, member) => {
            acc.puntos += member.user.puntuacion?.puntosTotales ?? 0;
            acc.edificios += member.user.propiedades.length;
            acc.armas += member.totalResources.armas;
            acc.municion += member.totalResources.municion;
            acc.alcohol += member.totalResources.alcohol;
            acc.dolares += member.totalResources.dolares;
            acc.produccionArmas += member.production.armas;
            acc.produccionMunicion += member.production.municion;
            acc.produccionAlcohol += member.production.alcohol;
            acc.produccionDolares += member.production.dolares;

            member.troops.forEach((count, id) => {
                acc.troops[id] = (acc.troops[id] || 0) + count;
            });

            return acc;
        }, {
            puntos: 0, edificios: 0, armas: 0, municion: 0, alcohol: 0, dolares: 0,
            produccionArmas: 0, produccionMunicion: 0, produccionAlcohol: 0, produccionDolares: 0,
            troops: {} as Record<string, number>
        });
    }, [membersData]);
    
    const { trainingNames, troopNames } = useMemo(() => {
        const trainingNames = new Map<string, string>();
        const troopNames = new Map<string, string>();
    
        family.members.forEach(member => {
            member.user.propiedades.forEach(p => {
                p.habitaciones.forEach(h => {
                    if (!troopNames.has(h.configuracionHabitacionId)) {
                        troopNames.set(h.configuracionHabitacionId, h.configuracionHabitacion.nombre);
                    }
                });
                [...p.TropaUsuario, ...p.TropaSeguridadUsuario].forEach(t => {
                    if (!troopNames.has(t.configuracionTropaId)) {
                        troopNames.set(t.configuracionTropaId, t.configuracionTropa.nombre);
                    }
                });
            });
            member.user.entrenamientos.forEach(t => {
                if (!trainingNames.has(t.configuracionEntrenamientoId)) {
                    trainingNames.set(t.configuracionEntrenamientoId, t.configuracionEntrenamiento.nombre);
                }
            });
        });
    
        return { trainingNames, troopNames };
    }, [family.members]);

    const resourceRows = [
        { label: "Puntos", getValue: (m: MemberData) => formatNumber(m.user.puntuacion?.puntosTotales ?? 0), getTotal: () => formatNumber(familyTotals.puntos), positive: false },
        { label: "Edificios", getValue: (m: MemberData) => formatNumber(m.user.propiedades.length), getTotal: () => formatNumber(familyTotals.edificios), positive: false },
        { label: "Armas", getValue: (m: MemberData) => formatNumber(m.totalResources.armas), getTotal: () => formatNumber(familyTotals.armas), positive: false },
        { label: "Municion", getValue: (m: MemberData) => formatNumber(m.totalResources.municion), getTotal: () => formatNumber(familyTotals.municion), positive: false },
        { label: "Alcohol", getValue: (m: MemberData) => formatNumber(m.totalResources.alcohol), getTotal: () => formatNumber(familyTotals.alcohol), positive: false },
        { label: "Dolares", getValue: (m: MemberData) => formatNumber(m.totalResources.dolares), getTotal: () => formatNumber(familyTotals.dolares), positive: false },
        { label: "Armas/Hora", getValue: (m: MemberData) => `+${formatNumber(m.production.armas)}`, getTotal: () => `+${formatNumber(familyTotals.produccionArmas)}`, positive: true },
        { label: "Municion/Hora", getValue: (m: MemberData) => `+${formatNumber(m.production.municion)}`, getTotal: () => `+${formatNumber(familyTotals.produccionMunicion)}`, positive: true },
        { label: "Alcohol/Hora", getValue: (m: MemberData) => `${m.production.alcohol >= 0 ? '+' : ''}${formatNumber(m.production.alcohol)}`, getTotal: () => `${familyTotals.produccionAlcohol >= 0 ? '+' : ''}${formatNumber(familyTotals.produccionAlcohol)}`, positive: true },
        { label: "Dolares/Hora", getValue: (m: MemberData) => `+${formatNumber(m.production.dolares)}`, getTotal: () => `+${formatNumber(familyTotals.produccionDolares)}`, positive: true },
    ];
    
    const renderDesktopTable = () => (
         <Card>
            <CardContent className="p-0">
                <ScrollArea className="w-full whitespace-nowrap h-[75vh]">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-background/95 z-10 w-[180px]">Jugador</TableHead>
                                {membersData.map(member => (
                                    <TableHead key={member.userId} className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1">{roleIcons[member.role]}<span className="font-bold">{member.user.name}</span></div>
                                            <span className="text-xs text-muted-foreground">({member.role})</span>
                                            <Avatar className="h-12 w-12 mt-1"><AvatarImage src={member.user.avatarUrl || ''} /><AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback></Avatar>
                                        </div>
                                    </TableHead>
                                ))}
                                <TableHead className="text-center font-bold text-primary">Total Familia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             <TableRow><TableCell colSpan={membersData.length + 2} className="h-2 bg-muted/50 p-0 font-bold text-center text-primary">RECURSOS</TableCell></TableRow>
                            {resourceRows.map(row => (
                                 <TableRow key={row.label} className="even:bg-muted/20">
                                    <TableCell className="sticky left-0 bg-background/95 font-semibold">{row.label}</TableCell>
                                    {membersData.map(member => (
                                        <TableCell key={member.userId} className={`text-center font-mono ${row.positive ? 'text-green-400' : 'text-foreground'}`}>
                                            {row.getValue(member)}
                                        </TableCell>
                                    ))}
                                    <TableCell className={`text-center font-mono font-bold ${row.positive ? 'text-green-400' : 'text-primary'}`}>{row.getTotal()}</TableCell>
                                </TableRow>
                            ))}
                            
                             <TableRow><TableCell colSpan={membersData.length + 2} className="h-2 bg-muted/50 p-0 font-bold text-center text-primary">ENTRENAMIENTOS</TableCell></TableRow>
                            
                            {TRAINING_ORDER.map(trainingId => {
                                const trainingName = trainingNames.get(trainingId);
                                if (!trainingName) return null;

                                const maxLevel = Math.max(...membersData.map(m => m.trainingLevels.get(trainingId) || 0));

                                return (
                                    <TableRow key={trainingId} className="even:bg-muted/20">
                                        <TableCell className="sticky left-0 bg-background/95 font-semibold">{trainingName}</TableCell>
                                        {membersData.map(member => (
                                            <TableCell key={member.userId} className="text-center font-mono">
                                                {member.trainingLevels.get(trainingId) || 0}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-center font-mono font-bold text-primary">{maxLevel}</TableCell>
                                    </TableRow>
                                )
                            })}

                             <TableRow><TableCell colSpan={membersData.length + 2} className="h-2 bg-muted/50 p-0 font-bold text-center text-primary">TROPAS</TableCell></TableRow>

                            {RECRUITMENT_TROOP_ORDER.concat(SECURITY_TROOP_ORDER).map(troopId => {
                                 const troopName = troopNames.get(troopId);
                                 if (!troopName) return null;
                                 const total = familyTotals.troops[troopId] || 0;
                                 return (
                                     <TableRow key={troopId} className="even:bg-muted/20">
                                        <TableCell className="sticky left-0 bg-background/95 font-semibold">{troopName}</TableCell>
                                        {membersData.map(member => (
                                            <TableCell key={member.userId} className="text-center font-mono">{formatNumber(member.troops.get(troopId) || 0)}</TableCell>
                                        ))}
                                        <TableCell className="text-center font-mono font-bold text-primary">{formatNumber(total)}</TableCell>
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
            {membersData.map(member => (
                <Card key={member.userId}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16"><AvatarImage src={member.user.avatarUrl || ''} /><AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                             <CardTitle className="flex items-center gap-2">{roleIcons[member.role]} {member.user.name}</CardTitle>
                             <CardDescription>{member.role}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" value={openAccordions} onValueChange={setOpenAccordions}>
                            <AccordionItem value="puntos">
                                <AccordionTrigger>Resumen de Puntos y Recursos</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    {resourceRows.map(row => (
                                        <div key={row.label} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{row.label}</span>
                                            <span className={cn("font-semibold", row.positive ? 'text-green-400' : 'text-foreground')}>{row.getValue(member)}</span>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="entrenamientos">
                                <AccordionTrigger>Entrenamientos</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                     {TRAINING_ORDER.map(id => {
                                         const name = trainingNames.get(id);
                                         if(!name) return null;
                                         return (
                                            <div key={id} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{name}</span>
                                                <span className="font-semibold">{member.trainingLevels.get(id) || 0}</span>
                                            </div>
                                         )
                                     })}
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="tropas">
                                <AccordionTrigger>Tropas</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                     {RECRUITMENT_TROOP_ORDER.concat(SECURITY_TROOP_ORDER).map(id => {
                                         const name = troopNames.get(id);
                                         if(!name) return null;
                                         return (
                                            <div key={id} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{name}</span>
                                                <span className="font-semibold">{formatNumber(member.troops.get(id) || 0)}</span>
                                            </div>
                                         )
                                     })}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Visión Global de la Familia</h2>
                    <p className="text-muted-foreground">
                       Comparativa de todos los miembros de {family.name}
                    </p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/family">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
            </div>
            {isMobile ? renderMobileCards() : renderDesktopTable()}
        </div>
    )
}
