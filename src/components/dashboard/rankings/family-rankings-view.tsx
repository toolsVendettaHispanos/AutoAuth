
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import type { FullFamily } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FamilyRankingsViewProps {
    families: FullFamily[];
    currentUserFamilyId?: string | null;
    page: number;
    pageSize: number;
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

const medalColors = [
    "text-amber-400", // Gold
    "text-slate-400", // Silver
    "text-amber-600"  // Bronze
];

export function FamilyRankingsView({ families, currentUserFamilyId, page, pageSize }: FamilyRankingsViewProps) {
    if (!families || families.length === 0) {
        return (
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No hay familias en la clasificación.
                </CardContent>
            </Card>
        )
    }

    // You might need to calculate total points for families in the future
    const sortedFamilies = families; //.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

    return (
        <div className="animate-fade-in">
            <Card className="mt-4">
                <CardContent className="p-0">
                    {/* Desktop Table */}
                    <Table className="hidden md:table">
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/80">
                                <TableHead className="w-[80px] font-bold">#</TableHead>
                                <TableHead className="font-bold">NOMBRE</TableHead>
                                <TableHead className="text-right font-bold">PUNTOS TOTALES</TableHead>
                                <TableHead className="text-right font-bold">MIEMBROS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedFamilies.map((family, index) => {
                                const rank = page * pageSize + index + 1;
                                return (
                                <TableRow key={family.id} className={cn(family.id === currentUserFamilyId && "bg-primary/10 hover:bg-primary/20")}>
                                    <TableCell className="font-medium text-lg flex items-center gap-2">
                                        {rank <= 3 && <Medal className={cn("h-5 w-5", medalColors[rank - 1])} />}
                                        {rank}
                                    </TableCell>
                                    <TableCell className="font-bold">
                                         <Link href={`/family/members?id=${family.id}`} className="hover:underline flex items-center gap-3">
                                             <Avatar className="h-10 w-10">
                                                <AvatarImage src={family.avatarUrl || ''} />
                                                <AvatarFallback>{family.tag}</AvatarFallback>
                                            </Avatar>
                                            <span>[{family.tag}] {family.name}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary font-mono">{formatPoints(0)}</TableCell>
                                    <TableCell className="text-right font-mono">{family.members.length}</TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                     {/* Mobile Cards */}
                    <div className="md:hidden">
                        <div className="space-y-2 p-2">
                            {sortedFamilies.map((family, index) => {
                                const rank = page * pageSize + index + 1;
                                return (
                                <Card key={family.id} className={cn("p-4", family.id === currentUserFamilyId && "bg-primary/10 border-primary/20")}>
                                     <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold text-muted-foreground w-8 flex items-center gap-1">
                                                {rank <= 3 && <Medal className={cn("h-5 w-5", medalColors[rank-1])} />}
                                                #{rank}
                                            </span>
                                            <Link href={`/family/members?id=${family.id}`} className="hover:underline">
                                                <span className="font-bold text-lg">[{family.tag}] {family.name}</span>
                                            </Link>
                                        </div>
                                         <div className="text-right">
                                            <div className="font-bold text-primary text-lg">{formatPoints(0)}</div>
                                            <div className="text-xs text-muted-foreground">Puntos</div>
                                        </div>
                                    </div>
                                    <Separator className="my-3" />
                                     <div className="text-right text-sm">
                                        <span className="text-muted-foreground">Miembros:</span>
                                        <span className="font-semibold ml-2">{family.members.length}</span>
                                    </div>
                                </Card>
                            )})}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
