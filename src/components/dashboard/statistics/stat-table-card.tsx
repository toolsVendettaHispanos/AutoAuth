
'use client';

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy } from "lucide-react";

interface StatTableCardProps {
    title: string;
    headers: string[];
    data: (string | number)[][];
    hasProgress?: boolean;
}

function formatNumber(value: string | number) {
    if (typeof value === 'number') {
        return value.toLocaleString('de-DE');
    }
    return value;
}

export function StatTableCard({ title, headers, data, hasProgress = false }: StatTableCardProps) {
    const isMobile = useIsMobile();
    
    const finalHeaders = hasProgress && !isMobile ? [...headers, 'Progreso'] : headers;

    return (
        <Card className="overflow-hidden">
            <div className="bg-primary text-primary-foreground p-4">
                <h3 className="font-heading text-xl tracking-wider">{title}</h3>
            </div>
            <div className="bg-card">
                 <Table>
                    <TableHeader>
                        <TableRow className="border-b-white/10 hover:bg-white/5">
                            {finalHeaders.map((header, index) => (
                                <TableHead 
                                    key={index} 
                                    className={cn(
                                        "font-bold text-white/90", 
                                        index > 0 && "text-right",
                                        isMobile && header === 'Nivel Máximo' && "hidden"
                                    )}
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, rowIndex) => {
                             const userValue = hasProgress ? (row[1] as number) : 0;
                             const maxValue = hasProgress ? (row[2] as number) : 0;
                             const progress = maxValue > 0 ? (userValue / maxValue) * 100 : 0;
                             const isRecord = userValue > 0 && userValue === maxValue;
                             
                             return (
                                <TableRow key={rowIndex} className="border-b-white/10 hover:bg-white/5">
                                    {row.map((cell, cellIndex) => (
                                        <TableCell 
                                            key={cellIndex} 
                                            className={cn(
                                                'py-3',
                                                cellIndex > 0 ? 'text-right' : 'font-medium',
                                                isMobile && headers[cellIndex] === 'Nivel Máximo' && "hidden"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {cellIndex === 0 && isRecord && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Trophy className="h-4 w-4 text-amber-400" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Récord del Servidor</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                {formatNumber(cell)}
                                            </div>
                                        </TableCell>
                                    ))}
                                    {hasProgress && !isMobile && (
                                        <TableCell className="w-[150px]">
                                             <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-green-400 to-cyan-400" />
                                        </TableCell>
                                    )}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
