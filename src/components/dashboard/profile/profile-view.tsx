
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UserProfileData } from "@/lib/types";
import { Building, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface ProfileViewProps {
    user: UserProfileData;
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function ProfileView({ user }: ProfileViewProps) {
    const router = useRouter();

    const handleSendMission = (ciudad: number, barrio: number, edificio: number) => {
        const params = new URLSearchParams();
        params.set('ciudad', ciudad.toString());
        params.set('barrio', barrio.toString());
        params.set('edificio', edificio.toString());
        router.push(`/missions?${params.toString()}`);
    }

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden">
                <div className="relative h-40 bg-muted">
                    <Image 
                        src="/img/general/fondo.jpg" 
                        alt="Profile Banner" 
                        fill 
                        className="object-cover"
                        data-ai-hint="dark city skyline"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="p-4 flex flex-col items-center sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20 z-10 relative">
                     <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                        <AvatarImage src={user.avatarUrl || ''} alt={user.name} data-ai-hint="mafia boss" />
                        <AvatarFallback className="text-4xl">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center sm:text-left">
                        {user.familyMember && (
                             <Link href={`/family/members?id=${user.familyMember.family.id}`} className="flex items-center gap-2 hover:underline justify-center sm:justify-start">
                                 <Avatar className="h-6 w-6">
                                    <AvatarImage src={user.familyMember.family.avatarUrl || ''} />
                                    <AvatarFallback>{user.familyMember.family.tag.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-primary">[{user.familyMember.family.tag}] {user.familyMember.family.name}</span>
                             </Link>
                        )}
                        <h2 className="text-4xl font-bold tracking-tight font-heading">{user.name}</h2>
                        <p className="text-lg text-muted-foreground">{user.title || 'Jefe Mafioso'}</p>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-xs text-muted-foreground">Puntos Totales</p>
                        <p className="text-4xl font-bold text-primary font-mono">{formatPoints(user.puntuacion?.puntosTotales)}</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas de Puntuación</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Puntos de Edificios</span><span className="font-semibold font-mono">{formatPoints(user.puntuacion?.puntosHabitaciones)}</span></div>
                            <Separator />
                            <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Puntos de Tropas</span><span className="font-semibold font-mono">{formatPoints(user.puntuacion?.puntosTropas)}</span></div>
                            <Separator />
                            <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Puntos de Entrenamiento</span><span className="font-semibold font-mono">{formatPoints(user.puntuacion?.puntosEntrenamientos)}</span></div>
                            <Separator />
                             <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Puntos de Honor (Atacante)</span><span className="font-semibold font-mono text-green-400">{formatPoints(user.puntuacion?.puntosHonorAtacante)}</span></div>
                             <Separator />
                             <div className="flex justify-between items-baseline"><span className="text-muted-foreground">Puntos de Honor (Defensor)</span><span className="font-semibold font-mono text-red-400">{formatPoints(user.puntuacion?.puntosHonorDefensor)}</span></div>
                             <Separator />
                             <div className="flex justify-between items-baseline"><span className="text-muted-foreground font-bold">Puntos de Honor (Total)</span><span className="font-semibold font-mono text-primary">{formatPoints(user.puntuacion?.puntosHonorTotales)}</span></div>
                            <Separator />
                             <div className="flex justify-between text-xs text-muted-foreground pt-2">
                                <span>Miembro desde</span>
                                <span>{new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Propiedades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {user.propiedades.map(prop => (
                                <div key={prop.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{prop.nombre}</p>
                                        <p className="text-sm text-muted-foreground">[{prop.ciudad}:{prop.barrio}:{prop.edificio}]</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={`/rooms/${prop.ciudad}:${prop.barrio}:${prop.edificio}`}>
                                                <Building className="mr-2 h-4 w-4" />
                                                Gestionar
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
