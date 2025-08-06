
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getPropertiesByLocation } from '@/lib/data';
import type { UserWithProgress, PropertyWithOwner } from '@/lib/types';
import { ChevronLeft, ChevronRight, Loader2, Send, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

const BuildingGrid = ({ properties, currentUser, currentCiudad, currentBarrio }: { properties: PropertyWithOwner[], currentUser: UserWithProgress, currentCiudad: number, currentBarrio: number }) => {
    const router = useRouter();
    const buildings = Array.from({ length: 255 }, (_, i) => {
        const edificio = i + 1;
        const property = properties.find(p => p.edificio === edificio);
        return { edificio, property };
    });

    const handleSendMission = (ciudad: number, barrio: number, edificio: number) => {
        const params = new URLSearchParams();
        params.set('ciudad', ciudad.toString());
        params.set('barrio', barrio.toString());
        params.set('edificio', edificio.toString());
        router.push(`/missions?${params.toString()}`);
    }

    const getBuildingColor = (property: PropertyWithOwner | undefined): string => {
        if (!property || !property.user) {
            return "bg-black/40 border-black/60 hover:bg-black/60"; // Desocupado
        }
        if (property.userId === currentUser.id) {
            return "bg-primary/70 border-primary/90 text-primary-foreground hover:bg-primary hover:shadow-primary/50 hover:shadow-lg"; // Propio
        }
        if (property.user.familyMember?.familyId && property.user.familyMember.familyId === currentUser.familyMember?.familyId) {
            return "bg-accent/70 border-accent/90 text-accent-foreground hover:bg-accent hover:shadow-accent/50 hover:shadow-lg"; // Familia
        }
        return "bg-destructive/70 border-destructive/90 text-destructive-foreground hover:bg-destructive hover:shadow-destructive/50 hover:shadow-lg"; // Enemigo
    };

    return (
        <div className="relative w-full aspect-[17/15] rounded-lg border overflow-hidden bg-black shadow-inner shadow-black/50">
             <Image
                src="/img/map.png"
                alt="Mapa de la ciudad"
                fill
                className="object-cover z-0 opacity-40"
                data-ai-hint="city map background"
            />
            <div className="absolute inset-0 grid grid-cols-17 gap-0.5 p-1 z-10">
                {buildings.map(({ edificio, property }) => (
                    <TooltipProvider key={edificio} delayDuration={0}>
                        <Tooltip>
                            <Dialog>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <div className={cn(
                                            "aspect-square flex items-center justify-center rounded-sm text-xs font-bold transition-all duration-200 cursor-pointer border hover:scale-110 hover:z-20",
                                            getBuildingColor(property)
                                        )}>
                                            <span className="opacity-75">{property && edificio}</span>
                                        </div>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Propiedad en [{currentCiudad}:{currentBarrio}:{edificio}]</DialogTitle>
                                         <DialogDescription>
                                            {property ? (
                                                `Esta propiedad pertenece a ${property.user?.name || 'Desconocido'}.`
                                            ) : (
                                                "Este solar está actualmente desocupado."
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>
                                    {property && property.user && (
                                        <div className='flex items-center gap-4'>
                                             <Avatar className="h-20 w-20 border-2 border-primary">
                                                <AvatarImage src={property.user.avatarUrl || ''} alt={property.user.name || ''} data-ai-hint="mafia boss" />
                                                <AvatarFallback>{property.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className='space-y-1'>
                                                <p><strong>Jugador:</strong> {property.user.name}</p>
                                                <p><strong>Familia:</strong> {property.user.familyMember?.family.name || 'Sin familia'}</p>
                                                <p><strong>Puntos:</strong> {property.user.puntuacion?.puntosTotales.toLocaleString('de-DE') || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}
                                    <DialogFooter>
                                         <DialogClose asChild>
                                            <Button variant="outline">Cerrar</Button>
                                        </DialogClose>
                                        <Button onClick={() => handleSendMission(currentCiudad, currentBarrio, edificio)}>
                                            <Send className="mr-2 h-4 w-4" />
                                            Enviar Misión
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <TooltipContent>
                                <p className='font-bold text-base'>[{currentCiudad}:{currentBarrio}:{edificio}]</p>
                                <Separator className='my-1'/>
                                <p className='text-sm'>{property?.user?.name || "Desocupado"}</p>
                                {property?.user?.familyMember && <p className='text-xs text-muted-foreground'>Familia: {property.user.familyMember.family.name}</p>}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    );
};

const CoordinateInput = ({ label, value, onChange }: { label: string, value: number, onChange: (newValue: number) => void }) => {
    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val > 0) {
            onChange(val);
        } else if (e.target.value === '') {
            onChange(1); 
        }
    };
    
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium">{label}</span>
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 transition-colors" onClick={() => onChange(Math.max(1, value - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input 
                    type="number" 
                    className="w-16 h-8 text-center" 
                    value={value}
                    onChange={handleManualChange}
                />
                <Button variant="outline" size="icon" className="h-8 w-8 transition-colors" onClick={() => onChange(value + 1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export function MapView({ initialCiudad, initialBarrio, initialProperties, currentUser }: { initialCiudad: number, initialBarrio: number, initialProperties: PropertyWithOwner[], currentUser: UserWithProgress }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [ciudad, setCiudad] = useState(initialCiudad);
    const [barrio, setBarrio] = useState(initialBarrio);
    const [properties, setProperties] = useState(initialProperties);
    const [isLoading, setIsLoading] = useState(false);

    const updateMap = useCallback((newCiudad: number, newBarrio: number) => {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams);
        params.set('ciudad', newCiudad.toString());
        params.set('barrio', newBarrio.toString());
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    useEffect(() => {
        const ciudadParam = searchParams.get('ciudad');
        const barrioParam = searchParams.get('barrio');
        
        const newCiudad = ciudadParam ? parseInt(ciudadParam, 10) : initialCiudad;
        const newBarrio = barrioParam ? parseInt(barrioParam, 10) : initialBarrio;

        if (newCiudad !== ciudad || newBarrio !== barrio || !properties.length) {
            setCiudad(newCiudad);
            setBarrio(newBarrio);
            setIsLoading(true);
            getPropertiesByLocation(newCiudad, newBarrio).then((data: PropertyWithOwner[]) => {
                setProperties(data);
                setIsLoading(false);
            });
        }
    }, [searchParams, ciudad, barrio, initialCiudad, initialBarrio, properties.length]);

    return (
        <Card className="bg-card/80">
            <div className="space-y-4 p-4">
                <div className="flex flex-row flex-wrap justify-center items-end gap-2 p-2 rounded-lg bg-muted border">
                    <CoordinateInput label="Ciudad" value={ciudad} onChange={setCiudad} />
                    <CoordinateInput label="Barrio" value={barrio} onChange={setBarrio} />
                    <Button onClick={() => updateMap(ciudad, barrio)} disabled={isLoading} size="sm" className="h-8">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Ir
                    </Button>
                </div>

                <div className="relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg z-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                     <div className="flex justify-center mb-1">
                        <Button variant="ghost" size="icon" onClick={() => updateMap(ciudad, barrio - 1)}><ArrowUp className="h-5 w-5"/></Button>
                    </div>
                     <div className="flex items-center justify-center gap-1">
                         <Button variant="ghost" size="icon" onClick={() => updateMap(ciudad - 1, barrio)}><ArrowLeftIcon className="h-5 w-5"/></Button>
                        <BuildingGrid properties={properties} currentUser={currentUser} currentCiudad={ciudad} currentBarrio={barrio} />
                         <Button variant="ghost" size="icon" onClick={() => updateMap(ciudad + 1, barrio)}><ArrowRightIcon className="h-5 w-5"/></Button>
                    </div>
                     <div className="flex justify-center mt-1">
                        <Button variant="ghost" size="icon" onClick={() => updateMap(ciudad, barrio + 1)}><ArrowDown className="h-5 w-5"/></Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
