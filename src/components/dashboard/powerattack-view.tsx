
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserWithProgress } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';

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
    const userHonorLevel = user.entrenamientos.find(t => t.configuracionEntrenamientoId === 'honor')?.nivel || 0;
    const userPropertyCount = user.propiedades.length;
    const currentUserPower = calculatePower(userPropertyCount, userHonorLevel);

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

    const headers = ["C.Edis", ...Array.from({ length: 11 }, (_, i) => `H ${i}`)];

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

            <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-0">
                    <ScrollArea className="h-[70vh] w-full whitespace-nowrap rounded-md border">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    {headers.map((header, index) => (
                                        <TableHead 
                                            key={header} 
                                            className={cn(
                                                "sticky top-0 z-20 bg-muted/95 backdrop-blur-sm", 
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
        </div>
    )
}
