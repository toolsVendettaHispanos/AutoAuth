
'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight, MessageSquare, UserPlus, Users2, Wifi } from "lucide-react";
import { QueueStatusCard } from "./queue-status-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { UserWithProgress, FullConfiguracionTropa, FullFamilyMember } from "@/lib/types";
import { IncomingAttacks } from "./incoming-attacks";
import { TroopOverview } from "./troop-overview";
import { PlayerCard } from "./overview/player-card";
import { useProperty } from "@/contexts/property-context";
import { calcularPoderAtaque } from "@/lib/formulas/score-formulas";
import { MissionOverview } from "./overview/mission-overview";
import { FamilyCard } from "./overview/family-card";

function ActionIcons({ unreadMessages, inFamily }: { unreadMessages: number, inFamily: boolean }) {
    const actions = [
        { href: "/messages?categoria=SISTEMA", icon: <Bell className="h-5 w-5" />, notification: 0, label: "Notificaciones del Sistema" },
        { href: "/messages", icon: <MessageSquare className="h-5 w-5" />, notification: unreadMessages, label: "Mensajes" },
        { href: "/family", label: "Familia", icon: <Users2 className="h-5 w-5" /> },
    ]
    return (
        <div className="absolute top-4 right-4 flex flex-col items-center gap-3">
            {actions.map((action, index) => (
                 <TooltipProvider key={index} delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button asChild variant="outline" size="icon" className="h-9 w-9 bg-background/50 border-white/20 hover:bg-white/10 text-white relative backdrop-blur-sm">
                                <Link href={action.href}>
                                    {action.icon}
                                    <span className="sr-only">{action.label}</span>
                                    {action.notification && action.notification > 0 && 
                                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0">{action.notification}</Badge>
                                    }
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>{action.label}</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            ))}
        </div>
    )
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

interface OverviewViewProps {
    user: UserWithProgress;
    allRooms: { id: string; nombre: string; }[];
    allTroops: FullConfiguracionTropa[];
}

export function OverviewView({ user, allRooms, allTroops }: OverviewViewProps) {
    const { selectedProperty } = useProperty();
    const [lealtad, setLealtad] = useState<number | null>(null);

    useEffect(() => {
        const calculateLealtad = async () => {
             if (user) {
                 const honorLevel = user.entrenamientos.find(t => t.configuracionEntrenamientoId === 'honor')?.nivel || 0;
                 const propertyCount = user.propiedades.length;
                 const power = await calcularPoderAtaque(propertyCount, honorLevel);
                 setLealtad(Math.round(power));
            }
        };
        calculateLealtad();
    }, [user]);

    if (!user || !selectedProperty) {
        // This should be handled by the parent component's loading state
        return null;
    }

    const { puntuacion, familyMember } = user;
    const unreadMessages = user._count?.receivedMessages || 0;
    
    const membersOnline = familyMember?.family?.members?.filter((m: FullFamilyMember) => {
        if (!m.user.lastSeen) return false;
        const lastSeen = new Date(m.user.lastSeen).getTime();
        const now = new Date().getTime();
        return (now - lastSeen) < 5 * 60 * 1000; // 5 minutes threshold
    }).length || 0;

    return (
         <div className="flex-grow space-y-4 animate-fade-in">
            <IncomingAttacks attacks={user.incomingAttacks || []} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 space-y-4">
                    <PlayerCard user={user} />
                </div>
                 <div className="space-y-4 animate-fade-in-up lg:col-span-1" style={{ animationDelay: '100ms' }}>
                    <FamilyCard family={user.familyMember?.family} />
                </div>
 
                 <div className="lg:col-span-1 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                    <Card className="h-full group relative">
                        <CardContent className="p-0 flex flex-col items-center justify-center h-full">
                            {familyMember ? (
                                <>
                                    <Image 
                                        src={familyMember.family.avatarUrl || "/img/login_bg.jpg"}
                                        alt="Family Banner"
                                        fill
                                        className="object-cover rounded-lg transition-transform duration-500 ease-in-out group-hover:scale-105"
                                        data-ai-hint="mafia meeting room"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                                        <div className="flex items-end gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground text-white/80">Familia</p>
                                                <p className="text-xl font-bold font-heading tracking-widest">{familyMember.family.name}</p>
                                                <Badge variant="secondary" className="mt-1">[{familyMember.family.tag}]</Badge>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <div className="flex items-center gap-2 text-xs text-green-400">
                                                    <Wifi className="h-4 w-4" />
                                                    <span>{membersOnline} / {familyMember.family.members.length} en línea</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 flex flex-col items-center justify-center gap-2 h-full">
                                    <Users2 className="h-24 w-24 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Sin Familia</p>
                                    <Button asChild size="lg" className="mt-2 animate-fade-in">
                                        <Link href="/family">
                                            <UserPlus className="mr-2 h-5 w-5" />
                                            Unirse o Crear
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                        <ActionIcons unreadMessages={unreadMessages} inFamily={!!familyMember} />
                        <Link href="/family" className="absolute inset-0">
                            <span className="sr-only">Ir a la familia</span>
                        </Link>
                    </Card>
                 </div>
            </div>
            
             <QueueStatusCard user={user} allRooms={allRooms} allTroops={allTroops} />
            <MissionOverview missions={user.misiones} incomingAttacks={user.incomingAttacks || []} allTroops={allTroops}/>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                 {[{label: 'Puntos Entrenamiento', value: puntuacion?.puntosEntrenamientos},
                    {label: 'Puntos Edificios', value: puntuacion?.puntosHabitaciones},
                    {label: 'Puntos Tropas', value: puntuacion?.puntosTropas},
                    {label: 'Puntos Totales', value: puntuacion?.puntosTotales},
                    {label: 'Propiedades', value: user.propiedades.length},
                    {label: 'Lealtad', value: lealtad, isPercent: true}
                    ].map((item, index) => (
                    <Card key={item.label} className="text-center p-3 bg-destructive/80 text-white/90 border-destructive/90 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="font-bold text-2xl font-heading tracking-wider">
                            {item.value !== null ? formatPoints(item.value) : '...'}
                            {item.isPercent && item.value !== null && '%'}
                        </p>
                        {item.label === 'Lealtad' && <Link href="/powerattack" className="text-xs text-amber-300 hover:underline">Ver honor</Link>}
                    </Card>
                 ))}
            </div>
            
        </div>
    );
}
