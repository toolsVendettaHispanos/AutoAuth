
'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Users, Users2, Trophy, Swords } from "lucide-react";

const categories = [
    { value: '0', label: 'Jugadores', icon: <Users /> },
    { value: '1', label: 'Familias', icon: <Users2 /> },
    { value: '2', label: 'Honor', icon: <Trophy /> },
    { value: '3', label: 'Batallas', icon: <Swords /> }
];

const ranges = [
    { value: '0', label: '1-100' },
    { value: '1', label: '101-200' },
    { value: '2', label: '201-300' },
    { value: '3', label: '301-400' },
];

export function RankingTypeSelector() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const currentType = searchParams.get('type') || '0';
    const currentRange = searchParams.get('range') || '0';
    const isBattleRanking = currentType === '3';

    const handleValueChange = (key: 'type' | 'range', value: string) => {
        const params = new URLSearchParams(searchParams);
        if (key === 'type') {
            // Reset range when type changes
            params.set('type', value);
            params.delete('range');
        } else {
            params.set('range', value);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-2 w-full">
             <Tabs value={currentType} onValueChange={(value) => handleValueChange('type', value)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                    {categories.map(cat => (
                        <TabsTrigger key={cat.value} value={cat.value} className="gap-2 py-2">
                            {cat.icon}
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
             {!isBattleRanking && (
                <Tabs value={currentRange} onValueChange={(value) => handleValueChange('range', value)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                        {ranges.map(range => (
                            <TabsTrigger key={range.value} value={range.value}>{range.label}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
             )}
        </div>
    );
}
