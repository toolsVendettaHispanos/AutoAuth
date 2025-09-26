
'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from 'lucide-react';
import { ConfiguracionTropa } from '@prisma/client';

interface GlobalViewData {
    id: string;
    name: string;
    points: number;
    resources: {
        armas: number;
        municion: number;
        alcohol: number;
        dolares: number;
    };
    troops: Record<string, number>;
}

interface GlobalViewProps {
    initialData: GlobalViewData[];
    troopConfigs: ConfiguracionTropa[];
}

function formatNumber(num: number) {
    if (!num) return '0';
    return num.toLocaleString('de-DE');
}

export function GlobalView({ initialData, troopConfigs }: GlobalViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof GlobalViewData | string; direction: 'asc' | 'desc' } | null>({ key: 'points', direction: 'desc' });
    
    const filteredAndSortedData = initialData
        .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (!sortConfig) return 0;
            
            const { key, direction } = sortConfig;
            let aValue: any;
            let bValue: any;

            if (key in a) {
                aValue = a[key as keyof GlobalViewData];
                bValue = b[key as keyof GlobalViewData];
            } else if (key.startsWith('resource_')) {
                const resource = key.replace('resource_', '') as keyof GlobalViewData['resources'];
                aValue = a.resources[resource];
                bValue = b.resources[resource];
            } else if (key.startsWith('troop_')) {
                const troopId = key.replace('troop_', '');
                aValue = a.troops[troopId] || 0;
                bValue = b.troops[troopId] || 0;
            }

            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    const requestSort = (key: keyof GlobalViewData | string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    const resourceHeaders = [
        { key: 'resource_armas', label: 'Armas' },
        { key: 'resource_municion', label: 'Munición' },
        { key: 'resource_alcohol', label: 'Alcohol' },
        { key: 'resource_dolares', label: 'Dólares' },
    ];

    const troopHeaders = troopConfigs.map(config => ({
        key: `troop_${config.id}`,
        label: config.nombre,
    }));

    return (
        <Card>
            <CardContent className="p-4 space-y-4">
                <Input
                    placeholder="Buscar por jugador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <ScrollArea className="h-[75vh] w-full border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-muted z-10">
                                    <Button variant="ghost" onClick={() => requestSort('name')}>
                                        Jugador <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => requestSort('points')}>
                                        Puntos <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                {resourceHeaders.map(header => (
                                    <TableHead key={header.key}>
                                         <Button variant="ghost" onClick={() => requestSort(header.key)}>
                                            {header.label} <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                ))}
                                {troopHeaders.map(header => (
                                    <TableHead key={header.key}>
                                         <Button variant="ghost" onClick={() => requestSort(header.key)}>
                                            {header.label} <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedData.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="sticky left-0 bg-muted z-10 font-medium">{user.name}</TableCell>
                                    <TableCell className="font-mono text-right">{formatNumber(user.points)}</TableCell>
                                    {resourceHeaders.map(header => (
                                        <TableCell key={header.key} className="font-mono text-right">{formatNumber(user.resources[header.key.replace('resource_', '') as keyof typeof user.resources])}</TableCell>
                                    ))}
                                    {troopHeaders.map(header => (
                                        <TableCell key={header.key} className="font-mono text-right">{formatNumber(user.troops[header.key.replace('troop_', '')] || 0)}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
