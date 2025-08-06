

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FullTropaUsuario } from '@/lib/types';
import Image from 'next/image';

interface TroopOverviewProps {
    troops: FullTropaUsuario[];
}

function formatNumber(num: number): string {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString('de-DE');
}

export function TroopOverview({ troops }: TroopOverviewProps) {
    const attackTroops = troops.filter(t => t.configuracionTropa.tipo === 'ATAQUE' && t.cantidad > 0);

    return (
        <Card className="h-full">
            <CardHeader className="p-2 bg-primary/80 text-primary-foreground rounded-t-lg">
                <CardTitle className="text-sm font-semibold tracking-wider text-center">TROPAS EN EDIFICIO</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                {attackTroops.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-4">
                       <p>No hay tropas de ataque en este edificio.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {attackTroops.map(troop => (
                            <div key={troop.configuracionTropaId} className="flex flex-col items-center justify-center text-center p-2 rounded-md hover:bg-muted/50">
                                <div className="relative h-16 w-16 mb-2">
                                     <Image
                                        src={troop.configuracionTropa.urlImagen || "https://placehold.co/64x64.png"}
                                        alt={troop.configuracionTropa.nombre}
                                        fill
                                        className="object-contain"
                                        data-ai-hint="mafia unit character"
                                    />
                                </div>
                                <p className="text-sm font-semibold truncate text-muted-foreground">{troop.configuracionTropa.nombre}</p>
                                <p className="text-lg font-bold text-foreground">{formatNumber(troop.cantidad)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
