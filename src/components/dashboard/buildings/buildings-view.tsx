
'use client';

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FullPropiedad } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { updatePropertyDetails } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PropertyWithPoints = FullPropiedad & { puntos: number };

interface BuildingsViewProps {
    initialProperties: PropertyWithPoints[];
}

function formatPoints(points: number): string {
    return Math.floor(points).toLocaleString('de-DE');
}

export function BuildingsView({ initialProperties }: BuildingsViewProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [properties, setProperties] = useState(initialProperties);
    const [mainPropertyId, setMainPropertyId] = useState(
        initialProperties.find(p => p.nombre === 'Propiedad Principal')?.id || initialProperties[0]?.id
    );

    const handleNameChange = (id: string, newName: string) => {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, nombre: newName } : p));
    };

    const handleSubmit = () => {
        startTransition(async () => {
            const result = await updatePropertyDetails(properties, mainPropertyId);
            if(result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: result.success });
            }
        })
    }
    
    return (
        <Card>
            <CardContent className="p-0">
                <form action={handleSubmit}>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Principal</TableHead>
                                    <TableHead>Edificio</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead className="text-right">Puntos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {properties.map(prop => (
                                    <TableRow key={prop.id}>
                                        <TableCell>
                                            <RadioGroup
                                                value={mainPropertyId}
                                                onValueChange={setMainPropertyId}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value={prop.id} id={`main-${prop.id}`} />
                                                    <Label htmlFor={`main-${prop.id}`} className="sr-only">
                                                        Marcar {prop.nombre} como principal
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {prop.ciudad}:{prop.barrio}:{prop.edificio}
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                value={prop.nombre}
                                                onChange={(e) => handleNameChange(prop.id, e.target.value)}
                                                className="max-w-xs"
                                                disabled={isPending}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-semibold">
                                            {formatPoints(prop.puntos)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="p-4 flex justify-end">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Modificar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
