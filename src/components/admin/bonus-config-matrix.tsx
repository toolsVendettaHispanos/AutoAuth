
'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveTroopBonusConfig } from "@/lib/actions/admin.actions";
import { ConfiguracionTropa, TropaBonusContrincante } from "@prisma/client";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

interface BonusConfigMatrixProps {
    attackTroops: ConfiguracionTropa[];
    defenseTroops: ConfiguracionTropa[];
    initialBonusConfig: TropaBonusContrincante[];
}

export function BonusConfigMatrix({ attackTroops, defenseTroops, initialBonusConfig }: BonusConfigMatrixProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const initialMatrixState = () => {
        const matrix = new Map<string, Map<string, number>>();
        for (const bonus of initialBonusConfig) {
            if (!matrix.has(bonus.tropaAtacanteId)) {
                matrix.set(bonus.tropaAtacanteId, new Map());
            }
            matrix.get(bonus.tropaAtacanteId)!.set(bonus.tropaDefensoraId, bonus.factorPrioridad);
        }
        return matrix;
    };

    const [matrix, setMatrix] = useState(initialMatrixState);

    const handleInputChange = (attackerId: string, defenderId: string, value: string) => {
        const newMatrix = new Map(matrix);
        if (!newMatrix.has(attackerId)) {
            newMatrix.set(attackerId, new Map());
        }
        
        const numValue = parseFloat(value);
        if (value === '' || isNaN(numValue)) {
            newMatrix.get(attackerId)!.delete(defenderId);
        } else {
            newMatrix.get(attackerId)!.set(defenderId, numValue);
        }
        setMatrix(newMatrix);
    };

    const handleSubmit = () => {
        const bonusData: { tropaAtacanteId: string; tropaDefensoraId: string; factorPrioridad: number }[] = [];
        matrix.forEach((defenderMap, attackerId) => {
            defenderMap.forEach((factor, defenderId) => {
                // Solo guardamos si el factor es diferente de 1 para no llenar la DB
                if (factor !== 1) { 
                    bonusData.push({
                        tropaAtacanteId: attackerId,
                        tropaDefensoraId: defenderId,
                        factorPrioridad: factor,
                    });
                }
            });
        });

        startTransition(async () => {
            const result = await saveTroopBonusConfig(bonusData);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Configuración de bonus guardada.' });
            }
        });
    };
    
    const allDefenders = [...attackTroops, ...defenseTroops];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Matriz de Bonus de Ataque vs Tropas</CardTitle>
                <CardDescription>
                    Define el factor de prioridad de ataque. Un valor de 1.5 significa un 50% más de daño contra esa unidad. Un valor de 1 es el normal.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full whitespace-nowrap rounded-md border h-[75vh]">
                    <table className="min-w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="sticky top-0 left-0 z-20 bg-muted/80 p-2 border-b border-r text-xs font-semibold w-[150px] backdrop-blur-sm">Atacante / Defensor</th>
                                {attackTroops.map(defender => (
                                     <th key={defender.id} className="sticky top-0 z-10 p-2 border-b border-r text-xs font-semibold w-28 h-28 bg-blue-950/40 backdrop-blur-sm">
                                        <div className="[writing-mode:vertical-rl] origin-center -rotate-180">
                                            <span className="truncate block">{defender.nombre}</span>
                                        </div>
                                    </th>
                                ))}
                                {defenseTroops.map(defender => (
                                     <th key={defender.id} className="sticky top-0 z-10 p-2 border-b border-r text-xs font-semibold w-28 h-28 bg-red-950/40 backdrop-blur-sm">
                                        <div className="[writing-mode:vertical-rl] origin-center -rotate-180">
                                            <span className="truncate block">{defender.nombre}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {attackTroops.map(attacker => (
                                <tr key={attacker.id} className="even:bg-muted/20">
                                    <td className="sticky left-0 z-10 bg-card p-2 border-b border-r font-semibold w-[150px]">{attacker.nombre}</td>
                                    {allDefenders.map(defender => (
                                        <td key={defender.id} className={cn("p-1 border-b border-r text-center", attacker.id === defender.id && "bg-muted/30")}>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                className="w-20 h-8 mx-auto text-center tabular-nums"
                                                placeholder="1"
                                                value={matrix.get(attacker.id)?.get(defender.id) ?? ''}
                                                onChange={(e) => handleInputChange(attacker.id, defender.id, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ScrollArea>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
