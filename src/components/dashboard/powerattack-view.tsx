
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserWithProgress } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Target, Building, Trophy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

interface PowerAttackViewProps {
    user: UserWithProgress;
}

// Function to calculate power based on the provided formula
const calculatePower = (propertyCount: number, honorLevel: number): number => {
    if (propertyCount < 1) propertyCount = 1;
    if (honorLevel < 0) honorLevel = 0;
    const power = 1 / (1 + (Math.pow((propertyCount - 1), (4.5 - (honorLevel / 10)))) / 10000000);
    return power * 100;
};

export function PowerAttackView({ user }: PowerAttackViewProps) {
    const isMobile = useIsMobile();
    const userHonorLevel = user.entrenamientos.find(t => t.configuracionEntrenamientoId === 'honor')?.nivel || 0;
    const userPropertyCount = user.propiedades.length;
    const currentUserPower = calculatePower(userPropertyCount, userHonorLevel);
    
    // State for mobile interactive view
    const [interactiveProperties, setInteractiveProperties] = useState(userPropertyCount > 0 ? userPropertyCount : 1);
    const [interactiveHonor, setInteractiveHonor] = useState(userHonorLevel);
    const interactivePower = useMemo(() => calculatePower(interactiveProperties, interactiveHonor), [interactiveProperties, interactiveHonor]);

    const tableData = useMemo(() => {
        const data = [];
        for (let i = 1; i <= 100; i++) {
            const row: (string | number)[] = [i];
            for (let j = 0; j <= 10; j++) {
                const power = calculatePower(i, j);
                row.push(Math.round(power) + '%');
            }
            data.push(row);
        }
        return data;
    }, []);

    const headers = ["Propiedades", ...Array.from({ length: 11 }, (_, i) => `H ${i}`)];

    const renderDesktopView = () => (
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-0">
                <ScrollArea className="w-full whitespace-nowrap rounded-md border h-[70vh]">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                {headers.map((header, index) => (
                                    <TableHead 
                                        key={header} 
                                        className={cn(
                                            "sticky top-0 z-20 bg-muted/95 backdrop-blur-sm p-2 text-center", 
                                            index === 0 && "sticky left-0 z-30",
                                            (index - 1) === userHonorLevel && "bg-primary/30 text-primary-foreground"
                                        )}
                                    >
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map((row, rowIndex) => (
                                <TableRow key={rowIndex} className={cn("hover:bg-muted/40", (rowIndex + 1) === userPropertyCount && "bg-primary/20 hover:bg-primary/30")}>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell 
                                            key={cellIndex} 
                                            className={cn(
                                                "font-mono text-xs sm:text-sm p-1 sm:p-2 text-center",
                                                cellIndex === 0 && "sticky left-0 bg-muted/95 backdrop-blur-sm font-semibold",
                                                cellIndex === userHonorLevel + 1 && "bg-primary/20"
                                            )}
                                        >
                                            {cell}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
    
    const renderMobileView = () => (
         <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
             <CardHeader>
                <CardTitle>Calculadora de Poder</CardTitle>
                <CardDescription>Ajusta los valores para ver el poder de ataque resultante.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-base"><Building className="h-5 w-5"/> Número de Propiedades: <span className="font-bold text-primary">{interactiveProperties}</span></Label>
                    <Slider
                        value={[interactiveProperties]}
                        onValueChange={(val) => setInteractiveProperties(val[0])}
                        min={1}
                        max={100}
                        step={1}
                    />
                </div>
                 <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-base"><Trophy className="h-5 w-5"/> Nivel de Honor: <span className="font-bold text-primary">{interactiveHonor}</span></Label>
                    <Slider
                        value={[interactiveHonor]}
                        onValueChange={(val) => setInteractiveHonor(val[0])}
                        min={0}
                        max={10}
                        step={1}
                    />
                </div>
                <Card className="p-4 text-center border-primary/50 bg-primary/10">
                    <p className="text-sm text-primary font-semibold">Poder de Ataque Calculado</p>
                    <p className="text-4xl font-bold font-mono text-primary">{interactivePower.toFixed(2)}%</p>
                </Card>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tabla de Poder de Ataque</h2>
                <p className="text-muted-foreground">
                    Tu poder de ataque aumenta con el honor y disminuye con el número de propiedades.
                </p>
            </div>

            <Card className="border-primary/50 animate-fade-in-up">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-6 w-6 text-primary" />
                        Tu Poder de Ataque Actual
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl sm:text-4xl font-bold font-mono text-primary">{currentUserPower.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground">
                        Calculado con {userPropertyCount} propiedades y Honor nivel {userHonorLevel}.
                    </p>
                </CardContent>
            </Card>

            {isMobile ? renderMobileView() : renderDesktopView()}
        </div>
    )
}

    