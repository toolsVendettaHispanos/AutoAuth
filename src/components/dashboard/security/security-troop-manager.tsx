
'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { assignTroopsToSecurity, withdrawTroopsFromSecurity } from "@/lib/actions/troop.actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FullConfiguracionTropa } from "@/lib/types";

type TroopWithCount = FullConfiguracionTropa & { cantidad: number };

interface TroopManagerCardProps {
    title: string;
    troops: TroopWithCount[];
    action: (troopId: string, quantity: number) => void;
    isPending: boolean;
    buttonText: string;
    buttonIcon: React.ReactNode;
}

const TroopManagerCard = ({ title, troops, action, isPending, buttonText, buttonIcon }: TroopManagerCardProps) => {
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const handleQuantityChange = (id: string, value: number, max: number) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(0, Math.min(value, max))
        }));
    }

    const handleAction = (troopId: string) => {
        const quantity = quantities[troopId];
        if (quantity > 0) {
            action(troopId, quantity);
            setQuantities(prev => ({...prev, [troopId]: 0}));
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                        {troops.length > 0 ? troops.map(troop => (
                             <div key={troop.id} className="p-3 border rounded-lg space-y-3">
                                <div className="flex items-center gap-4">
                                    <Image src={troop.urlImagen || ''} alt={troop.nombre} width={48} height={40} className="rounded-md border p-1" />
                                    <div>
                                        <p className="font-semibold">{troop.nombre}</p>
                                        <p className="text-sm text-muted-foreground">Disponibles: {troop.cantidad.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Slider
                                        value={[quantities[troop.id] || 0]}
                                        onValueChange={(val) => handleQuantityChange(troop.id, val[0], troop.cantidad)}
                                        max={troop.cantidad}
                                        step={1}
                                        disabled={isPending}
                                    />
                                    <Input
                                        type="number"
                                        className="w-24 h-9 text-center"
                                        value={quantities[troop.id] || 0}
                                        onChange={(e) => handleQuantityChange(troop.id, parseInt(e.target.value, 10) || 0, troop.cantidad)}
                                        disabled={isPending}
                                    />
                                </div>
                                 <Button 
                                    size="sm" 
                                    className="w-full" 
                                    onClick={() => handleAction(troop.id)}
                                    disabled={isPending || !quantities[troop.id]}
                                >
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : buttonIcon}
                                    {buttonText}
                                </Button>
                             </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No hay unidades disponibles.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

interface SecurityTroopManagerProps {
    propertyId: string;
    availableTroops: TroopWithCount[];
    assignedTroops: TroopWithCount[];
}

export function SecurityTroopManager({ propertyId, availableTroops, assignedTroops }: SecurityTroopManagerProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAssign = (troopId: string, quantity: number) => {
        startTransition(async () => {
            const result = await assignTroopsToSecurity(propertyId, troopId, quantity);
            if(result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
            else toast({ title: 'Éxito', description: `${quantity} x ${troopId} asignadas a seguridad.`})
        });
    }

    const handleWithdraw = (troopId: string, quantity: number) => {
         startTransition(async () => {
            const result = await withdrawTroopsFromSecurity(propertyId, troopId, quantity);
            if(result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
            else toast({ title: 'Éxito', description: `${quantity} x ${troopId} retiradas de seguridad.`})
        });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TroopManagerCard 
                title="Unidades en la Propiedad"
                troops={availableTroops}
                action={handleAssign}
                isPending={isPending}
                buttonText="Asignar a Seguridad"
                buttonIcon={<ArrowRight className="mr-2 h-4 w-4"/>}
            />
             <TroopManagerCard 
                title="Tropas Asignadas a Seguridad"
                troops={assignedTroops}
                action={handleWithdraw}
                isPending={isPending}
                buttonText="Retirar de Seguridad"
                buttonIcon={<ArrowLeft className="mr-2 h-4 w-4"/>}
            />
        </div>
    );
}
