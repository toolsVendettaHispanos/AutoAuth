
'use client';

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { assignTroopsToSecurity, withdrawTroopsFromSecurity } from "@/lib/actions/troop.actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft, Building, Shield } from "lucide-react";
import Image from "next/image";
import type { FullConfiguracionTropa } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

type TroopWithCount = FullConfiguracionTropa & { cantidad: number };

interface TroopSecurityCardProps {
    troop: TroopWithCount & { assigned: number };
    onAssign: (troopId: string, quantity: number) => void;
    onWithdraw: (troopId: string, quantity: number) => void;
    isPending: boolean;
}

const TroopSecurityCard = ({ troop, onAssign, onWithdraw, isPending }: TroopSecurityCardProps) => {
    const [assignQty, setAssignQty] = useState(0);
    const [withdrawQty, setWithdrawQty] = useState(0);

    const handleAssign = () => {
        if (assignQty > 0) {
            onAssign(troop.id, assignQty);
            setAssignQty(0);
        }
    };

    const handleWithdraw = () => {
        if (withdrawQty > 0) {
            onWithdraw(troop.id, withdrawQty);
            setWithdrawQty(0);
        }
    };

    return (
        <Card className="overflow-hidden">
            <div className="p-4 flex items-center gap-4 bg-muted/30">
                 <Image src={troop.urlImagen || ''} alt={troop.nombre} width={64} height={56} className="rounded-md border p-1 bg-background" />
                <div>
                    <h4 className="font-bold text-lg">{troop.nombre}</h4>
                     <p className="text-sm text-muted-foreground">{troop.descripcion}</p>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-4 space-y-3">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span>En Propiedad</span>
                        </div>
                        <span className="font-bold font-mono text-lg">{troop.cantidad.toLocaleString()}</span>
                     </div>
                     <Slider
                        value={[assignQty]}
                        onValueChange={(val) => setAssignQty(val[0])}
                        max={troop.cantidad}
                        step={1}
                        disabled={isPending}
                    />
                    <div className="flex items-center gap-2">
                         <Input
                            type="number"
                            className="h-9 text-center"
                            value={assignQty}
                            onChange={(e) => setAssignQty(Math.max(0, Math.min(parseInt(e.target.value) || 0, troop.cantidad)))}
                            disabled={isPending}
                        />
                         <Button onClick={handleAssign} disabled={isPending || assignQty === 0} className="w-full">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <ArrowRight className="h-4 w-4"/>}
                            <span className="ml-2">Asignar</span>
                        </Button>
                    </div>
                </div>
                 <div className="p-4 space-y-3 bg-muted/50 border-l">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4 text-primary" />
                            <span>En Seguridad</span>
                        </div>
                        <span className="font-bold font-mono text-lg text-primary">{troop.assigned.toLocaleString()}</span>
                     </div>
                     <Slider
                        value={[withdrawQty]}
                        onValueChange={(val) => setWithdrawQty(val[0])}
                        max={troop.assigned}
                        step={1}
                        disabled={isPending}
                    />
                     <div className="flex items-center gap-2">
                         <Input
                            type="number"
                            className="h-9 text-center"
                            value={withdrawQty}
                            onChange={(e) => setWithdrawQty(Math.max(0, Math.min(parseInt(e.target.value) || 0, troop.assigned)))}
                            disabled={isPending}
                        />
                        <Button onClick={handleWithdraw} disabled={isPending || withdrawQty === 0} className="w-full" variant="secondary">
                             {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <ArrowLeft className="h-4 w-4"/>}
                            <span className="ml-2">Retirar</span>
                        </Button>
                    </div>
                </div>
             </div>
        </Card>
    );
};


interface SecurityTroopManagerProps {
    propertyId: string;
    availableTroops: TroopWithCount[];
    assignedTroops: TroopWithCount[];
    allDefenseTroops: TroopWithCount[];
}

export function SecurityTroopManager({ propertyId, allDefenseTroops, availableTroops, assignedTroops }: SecurityTroopManagerProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAssign = (troopId: string, quantity: number) => {
        startTransition(async () => {
            const result = await assignTroopsToSecurity(propertyId, troopId, quantity);
            if(result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
            else toast({ title: 'Éxito', description: `Tropas asignadas a seguridad.`})
        });
    }

    const handleWithdraw = (troopId: string, quantity: number) => {
         startTransition(async () => {
            const result = await withdrawTroopsFromSecurity(propertyId, troopId, quantity);
            if(result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
            else toast({ title: 'Éxito', description: `Tropas retiradas de seguridad.`})
        });
    }
    
    const combinedTroops = allDefenseTroops.map(config => {
        const available = availableTroops.find(t => t.id === config.id)?.cantidad || 0;
        const assigned = assignedTroops.find(t => t.id === config.id)?.cantidad || 0;
        return {
            ...config,
            cantidad: available,
            assigned: assigned,
        }
    }).filter(t => t.cantidad > 0 || t.assigned > 0);

    return (
        <div className="space-y-4">
            {combinedTroops.length > 0 ? combinedTroops.map(troop => (
                <TroopSecurityCard 
                    key={troop.id}
                    troop={troop}
                    onAssign={handleAssign}
                    onWithdraw={handleWithdraw}
                    isPending={isPending}
                />
            )) : (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No tienes unidades defensivas en esta propiedad.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
