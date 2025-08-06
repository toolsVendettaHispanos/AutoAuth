
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { FullFamily } from "@/lib/types";
import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FamilyCardProps {
    family?: FullFamily | null;
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function FamilyCard({ family }: FamilyCardProps) {
    if (!family) {
        return (
            <Card className="h-full flex flex-col items-center justify-center p-6 text-center transition-transform hover:scale-105">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold">Sin Familia</h3>
                <p className="text-muted-foreground mb-4">No perteneces a ninguna familia. ¡Crea o únete a una!</p>
                <Button asChild>
                    <Link href="/family/find">
                        Buscar o Crear Familia
                    </Link>
                </Button>
            </Card>
        );
    }

    const topMembers = family.members
      .sort((a, b) => (b.user.puntuacion?.puntosHonorTotales || 0) - (a.user.puntuacion?.puntosHonorTotales || 0))
      .slice(0, 3);


    return (
        <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-300">
             <Image 
                src="/nuevas/vendettasilueta.jpg" 
                alt="Family background"
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 opacity-30"
                data-ai-hint="dark meeting room"
            />
            <div className="absolute inset-0 bg-black/60 z-0" />
            <div className="relative z-10 flex flex-col flex-grow p-4">
                 <div className="flex flex-col sm:flex-row items-center gap-4 text-white mb-4 text-center sm:text-left">
                    <Avatar className="h-20 w-20 border-2 border-primary/50 shrink-0">
                        <AvatarImage src={family.avatarUrl || ''} />
                        <AvatarFallback className="text-2xl">{family.tag}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <CardTitle className="text-2xl font-bold tracking-wider [text-shadow:0_2px_4px_rgb(0_0_0_/_0.8)]">[{family.tag}] {family.name}</CardTitle>
                         <p className="text-sm text-white/80 flex items-center justify-center sm:justify-start gap-2"><Users className="h-4 w-4" />{family.members.length} Miembros</p>
                    </div>
                     <Button asChild size="sm" variant="outline" className="shrink-0 mt-4 sm:mt-0">
                        <Link href={`/family/members?id=${family.id}`}>
                            Ver Familia
                        </Link>
                    </Button>
                </div>
                 <div className="text-white flex-grow">
                    <h4 className="font-semibold mb-2 text-sm">Top Miembros (Honor)</h4>
                    <div className="space-y-2">
                         {topMembers.map(member => (
                            <TooltipProvider key={member.userId}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-3 text-sm bg-black/20 p-2 rounded-md transition-all hover:bg-primary/20">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.user.avatarUrl || ''} />
                                                <AvatarFallback>{member.user.name ? member.user.name.charAt(0) : 'U'}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium flex-grow truncate">{member.user.name || 'Usuario desconocido'}</span>
                                            <span className="font-mono text-amber-400">{formatPoints(member.user.puntuacion?.puntosHonorTotales)}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">{member.user.name}</p>
                                        <p>Puntos de Honor: {formatPoints(member.user.puntuacion?.puntosHonorTotales)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
