
'use client'

import { useState, useTransition, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getPropertyOwner } from '@/lib/data';
import type { FullConfiguracionTropa, FullTropaUsuario, MissionInput } from '@/lib/types';
import { debounce } from 'lodash';
import { Loader2, User, UserX, Clock, Send, Users, Package, PlaneTakeoff, Minus, Plus, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { enviarMision } from '@/lib/actions/mission.actions';
import { useToast } from '@/hooks/use-toast';
import { useProperty } from '@/contexts/property-context';
import { calcularDistancia, calcularDuracionViaje, calcularVelocidadFlota, convertirACoordenadasVirtuales, calcularCosteMision } from '@/lib/formulas/mission-formulas';
import { useSearchParams } from 'next/navigation';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';

type TroopInput = {
    id: string;
    cantidad: number;
}

function formatDuration(seconds: number): string {
    if (seconds <= 0) return "0s";

    const units: {name: string, seconds: number}[] = [
        { name: 'd', seconds: 86400 },
        { name: 'h', seconds: 3600 },
        { name: 'm', seconds: 60 },
        { name: 's', seconds: 1 }
    ];

    let remainingSeconds = seconds;
    let result = '';
    let parts = 0;

    for (const unit of units) {
        if (remainingSeconds >= unit.seconds && parts < 2) {
            const amount = Math.floor(remainingSeconds / unit.seconds);
            if (amount > 0) {
                result += `${amount}${unit.name} `;
                remainingSeconds %= unit.seconds;
                parts++;
            }
        }
    }

    return result.trim() || `${Math.round(seconds)}s`;
}

function formatNumber(num: number): string {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString('de-DE');
}

export function MissionsView({ troopConfigs }: { troopConfigs: FullConfiguracionTropa[] }) {
    const { selectedProperty } = useProperty();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [coordinates, setCoordinates] = useState({ 
        ciudad: searchParams.get('ciudad') || selectedProperty?.ciudad.toString() || '', 
        barrio: searchParams.get('barrio') || selectedProperty?.barrio.toString() || '', 
        edificio: searchParams.get('edificio') || '' 
    });

    const [targetOwner, setTargetOwner] = useState<{ id: string, name: string } | null | undefined>(undefined);
    const [isLoadingTarget, setIsLoadingTarget] = useState(false);
    const [missionType, setMissionType] = useState('ATAQUE');
    const [tropas, setTropas] = useState<TroopInput[]>([]);
    const [travelTime, setTravelTime] = useState<number>(0);
    const [travelCost, setTravelCost] = useState<number>(0);

    
    const troopConfigsMap = useMemo(() => new Map(troopConfigs.map(t => [t.id, t])), [troopConfigs]);

    const debouncedFetchOwner = useCallback(
        debounce(async (ciudad: number, barrio: number, edificio: number) => {
            if (!ciudad || !barrio || !edificio) {
                setTargetOwner(undefined);
                setIsLoadingTarget(false);
                return;
            };
            const owner = await getPropertyOwner({ ciudad, barrio, edificio });
            setTargetOwner(owner);
            setIsLoadingTarget(false);
        }, 500),
        []
    );

    useEffect(() => {
        const ciudad = searchParams.get('ciudad');
        const barrio = searchParams.get('barrio');
        const edificio = searchParams.get('edificio');

        const newCoords = {
            ciudad: ciudad || selectedProperty?.ciudad.toString() || '',
            barrio: barrio || selectedProperty?.barrio.toString() || '',
            edificio: edificio || ''
        }
        setCoordinates(newCoords);

        if (newCoords.ciudad && newCoords.barrio && newCoords.edificio) {
            setIsLoadingTarget(true);
            debouncedFetchOwner(parseInt(newCoords.ciudad, 10), parseInt(newCoords.barrio, 10), parseInt(newCoords.edificio, 10));
        }

    }, [searchParams, selectedProperty, debouncedFetchOwner]);

    const calculateTravelInfo = useCallback(() => {
        if (!selectedProperty || tropas.length === 0 || !coordinates.ciudad || !coordinates.barrio || !coordinates.edificio) {
            setTravelTime(0);
            setTravelCost(0);
            return;
        }

        const activeTroops = tropas.filter(t => t.cantidad > 0);
        if(activeTroops.length === 0) {
            setTravelTime(0);
            setTravelCost(0);
            return;
        }

        const velocidad = calcularVelocidadFlota(activeTroops, troopConfigsMap);
        const origenCoords = convertirACoordenadasVirtuales(selectedProperty);
        const destinoCoords = convertirACoordenadasVirtuales({
            ciudad: parseInt(coordinates.ciudad, 10),
            barrio: parseInt(coordinates.barrio, 10),
            edificio: parseInt(coordinates.edificio, 10),
        });
        const distancia = calcularDistancia(origenCoords, destinoCoords);
        const duracion = calcularDuracionViaje(distancia, velocidad);

        const tropasConSalario = activeTroops.map((t: TroopInput) => {
            const config = troopConfigsMap.get(t.id);
            return {
                cantidad: t.cantidad,
                salario: config?.salario || 0
            };
        });
        const coste = calcularCosteMision(tropasConSalario, distancia);
        
        setTravelTime(duracion);
        setTravelCost(coste);
    }, [tropas, coordinates, selectedProperty, troopConfigsMap]);

    
    useEffect(() => {
        calculateTravelInfo();
    }, [tropas, coordinates, selectedProperty, calculateTravelInfo]);
    

    const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newCoords = { ...coordinates, [name]: value };
        setCoordinates(newCoords);
        
        const { ciudad, barrio, edificio } = newCoords;
        if (ciudad && barrio && edificio) {
            setIsLoadingTarget(true);
            debouncedFetchOwner(parseInt(ciudad, 10), parseInt(barrio, 10), parseInt(edificio, 10));
        } else {
            setTargetOwner(undefined);
        }
    };
    
    const handleTroopChange = (troopId: string, cantidad: number) => {
        const tropaMax = selectedProperty?.TropaUsuario.find((t: FullTropaUsuario) => t.configuracionTropa.id === troopId)?.cantidad || 0;
        const safeCantidad = Math.max(0, Math.min(tropaMax, cantidad));

        setTropas(prev => {
            const existing = prev.find(t => t.id === troopId);
            if (existing) {
                if (safeCantidad > 0) {
                    return prev.map(t => t.id === troopId ? { ...t, cantidad: safeCantidad } : t);
                } else {
                    return prev.filter(t => t.id !== troopId);
                }
            } else if (safeCantidad > 0) {
                return [...prev, { id: troopId, cantidad: safeCantidad }];
            }
            return prev;
        })
    }

    const setAllMaxTroops = () => {
        if (!selectedProperty) return;
        const newTroopInputs = selectedProperty.TropaUsuario
            .filter((tropa: FullTropaUsuario) => tropa.configuracionTropa.tipo !== 'DEFENSA')
            .map((tropa: FullTropaUsuario) => ({
                id: tropa.configuracionTropa.id,
                cantidad: tropa.cantidad,
            }));
        setTropas(newTroopInputs);
    };
    
     const { totalCapacity } = useMemo(() => {
        return tropas.reduce((acc, t: TroopInput) => {
            const config = troopConfigsMap.get(t.id);
            if (config) {
                acc.totalCapacity += config.capacidad * t.cantidad;
            }
            return acc;
        }, { totalCapacity: 0 });
    }, [tropas, troopConfigsMap]);

    const handleSubmit = async () => {
        if (!selectedProperty) {
            toast({ variant: 'destructive', title: 'Error', description: 'No hay una propiedad de origen seleccionada.' });
            return;
        }

        startTransition(async () => {
            const result = await enviarMision({
                origenPropiedadId: selectedProperty.id,
                coordinates: {
                    ciudad: parseInt(coordinates.ciudad, 10),
                    barrio: parseInt(coordinates.barrio, 10),
                    edificio: parseInt(coordinates.edificio, 10)
                },
                tropas: tropas.filter(t => t.cantidad > 0),
                tipo: missionType
            });

            if (result.error) {
                toast({ variant: 'destructive', title: 'Error en la misión', description: result.error });
            } else {
                toast({ title: '¡Misión enviada!', description: result.success });
                setIsSuccess(true);
                setTimeout(() => {
                    setTropas([]);
                    setIsSuccess(false);
                }, 1500)
            }
        });
    }

    if (!selectedProperty) {
        return <p>Selecciona una propiedad para enviar misiones.</p>
    }

    const desiredOrder = [
        "maton", "portero", "acuchillador", "pistolero", "ocupacion", "espia", "porteador", "cia", "fbi",
        "transportista", "tactico", "francotirador", "asesino", "ninja", "demoliciones", "mercenario"
    ];

    const availableTroops = selectedProperty.TropaUsuario
        .filter((t: FullTropaUsuario) => t.cantidad > 0 && t.configuracionTropa.tipo !== 'DEFENSA')
        .sort((a: FullTropaUsuario, b: FullTropaUsuario) => {
            const indexA = desiredOrder.indexOf(a.configuracionTropa.id);
            const indexB = desiredOrder.indexOf(b.configuracionTropa.id);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Configuración de la Misión</CardTitle>
                            <CardDescription>Define el objetivo y el tipo de misión.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className='space-y-2'>
                                    <Label htmlFor='ciudad'>Ciudad</Label>
                                    <Input id='ciudad' name='ciudad' placeholder='1' value={coordinates.ciudad} onChange={handleCoordinateChange} />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='barrio'>Barrio</Label>
                                    <Input id='barrio' name='barrio' placeholder='1' value={coordinates.barrio} onChange={handleCoordinateChange} />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='edificio'>Edificio</Label>
                                    <Input id='edificio' name='edificio' placeholder='1' value={coordinates.edificio} onChange={handleCoordinateChange} />
                                </div>
                            </div>

                            <Card className='p-4 bg-muted/50'>
                                <div className='flex items-center gap-4'>
                                    {isLoadingTarget ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : targetOwner === undefined ? (
                                         <UserX className="h-6 w-6 text-muted-foreground" />
                                    ) : targetOwner === null ? (
                                         <UserX className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <User className="h-6 w-6 text-destructive" />
                                    )}
                                    <div>
                                        <p className='text-sm text-muted-foreground'>Objetivo</p>
                                        <p className='font-bold'>
                                            {isLoadingTarget ? 'Buscando...' : targetOwner?.name || 'Nadie'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                            
                             <div className='space-y-2'>
                                <Label htmlFor='missionType'>Tipo de Misión</Label>
                                <Select onValueChange={setMissionType} defaultValue={missionType}>
                                    <SelectTrigger id='missionType'>
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ATAQUE">Ataque</SelectItem>
                                        <SelectItem value="OCUPAR">Ocupar</SelectItem>
                                        <SelectItem value="DEFENDER">Defender</SelectItem>
                                        <SelectItem value="TRANSPORTE">Transporte</SelectItem>
                                        <SelectItem value="ESPIONAJE">Espionaje</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>2. Selección de Tropas</CardTitle>
                                    <CardDescription>Elige las unidades de {selectedProperty.nombre}</CardDescription>
                                </div>
                                <Button variant="secondary" size="sm" onClick={setAllMaxTroops}><Users className="mr-2"/>Todas</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-96 overflow-y-auto pr-2">
                             {availableTroops && availableTroops.length > 0 ? availableTroops.map((tropa: FullTropaUsuario) => {
                                const cantidadActual = tropas.find(t => t.id === tropa.configuracionTropaId)?.cantidad || 0;
                                return (
                                <div key={tropa.configuracionTropaId} className='p-3 border rounded-lg space-y-3'>
                                    <div className='flex items-center gap-3 flex-1'>
                                        <div className="w-12 h-10 relative rounded-md overflow-hidden border flex-shrink-0">
                                            <Image src={tropa.configuracionTropa.urlImagen} alt={tropa.configuracionTropa.nombre} fill className='object-contain' />
                                        </div>
                                        <div>
                                            <p className='font-semibold'>{tropa.configuracionTropa.nombre}</p>
                                            <p className='text-xs text-muted-foreground'>Disponibles: {tropa.cantidad}</p>
                                        </div>
                                    </div>
                                     <div className='flex items-center gap-2'>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTroopChange(tropa.configuracionTropaId, cantidadActual - 1)}><Minus /></Button>
                                        <Slider
                                            value={[cantidadActual]}
                                            onValueChange={(value) => handleTroopChange(tropa.configuracionTropaId, value[0])}
                                            max={tropa.cantidad}
                                            step={1}
                                            className="flex-1"
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTroopChange(tropa.configuracionTropaId, cantidadActual + 1)}><Plus/></Button>
                                        <Input 
                                            type='number'
                                            min="0"
                                            max={tropa.cantidad}
                                            value={cantidadActual}
                                            onChange={(e) => handleTroopChange(tropa.configuracionTropaId, parseInt(e.target.value) || 0)}
                                            className='h-9 w-24 text-center'
                                        />
                                    </div>
                                </div>
                            )}) : (
                                <p className="text-sm text-center text-muted-foreground py-4">No tienes tropas de ataque en esta propiedad.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>3. Resumen de la Misión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">Objetivo</p>
                            <p className="font-bold">{coordinates.ciudad}:{coordinates.barrio}:{coordinates.edificio}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">Tipo</p>
                            <p className="font-bold">{missionType}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">Tiempo de Viaje (ida)</p>
                            <p className="font-bold flex items-center justify-center gap-2"><Clock className="h-4 w-4"/> {formatDuration(travelTime)}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">Capacidad de Carga</p>
                            <p className="font-bold flex items-center justify-center gap-2"><Package className="h-4 w-4"/> {formatNumber(totalCapacity)}</p>
                        </div>
                         <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">Coste de la Misión</p>
                            <p className="font-bold flex items-center justify-center gap-2"><DollarSign className="h-4 w-4 text-green-500"/> {formatNumber(travelCost)}</p>
                        </div>
                     </div>
                     <Separator />
                    <Button onClick={handleSubmit} disabled={isPending || tropas.length === 0} className='w-full' size="lg">
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSuccess ? <PlaneTakeoff className="mr-2 h-5 w-5"/> : <Send className="mr-2 h-5 w-5" />)}
                        {isPending ? 'Enviando Flota...' : (isSuccess ? '¡Misión en Camino!' : 'Confirmar y Enviar Misión')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

