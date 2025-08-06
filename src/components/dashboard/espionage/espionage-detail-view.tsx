
'use client';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Eye, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FullEspionageReport, EspionageReportDetails } from "@/lib/types";
import { resourceIcons, ROOM_ORDER } from "@/lib/constants";
import Image from "next/image";
import { useMemo } from "react";

interface EspionageDetailViewProps {
    report: FullEspionageReport;
}

function formatNumber(num: number): string {
    if(num === undefined || num === null) return "0";
    return Math.floor(num).toLocaleString('de-DE');
}

export function EspionageDetailView({ report }: EspionageDetailViewProps) {
    const router = useRouter();
    const details = report.details as EspionageReportDetails;
    const combat = details.combat;
    const intel = details.intel;

    const sortedBuildings = useMemo(() => {
        if (!intel?.buildings) return [];
        return [...intel.buildings].sort((a, b) => {
            const indexA = ROOM_ORDER.indexOf(a.id);
            const indexB = ROOM_ORDER.indexOf(b.id);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [intel?.buildings]);

    return (
        <div className="w-full max-w-4xl mx-auto bg-black/80 border-primary border text-white font-mono flex flex-col h-full rounded-lg">
            <div className="p-6 pb-2 shrink-0 text-center">
                <h2 className="text-2xl text-primary tracking-widest font-heading">
                    INFORME DE ESPIONAJE
                </h2>
                <p className="text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleString('es-ES')}
                </p>
            </div>
             <div className="flex flex-row items-center justify-around p-4 border-y border-dashed border-white/20 gap-4 shrink-0">
                <Link href={`/profile/${report.attacker.id}`} className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20"><AvatarImage src={report.attacker.avatarUrl || ''} /><AvatarFallback>{report.attacker.name.charAt(0)}</AvatarFallback></Avatar>
                    <span className="font-bold text-base md:text-lg">{report.attacker.name}</span>
                </Link>
                <Eye className="h-10 w-10 text-destructive" />
                <Link href={`/profile/${report.defender.id}`} className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20"><AvatarImage src={report.defender.avatarUrl || ''} /><AvatarFallback>{report.defender.name.charAt(0)}</AvatarFallback></Avatar>
                    <span className="font-bold text-base md:text-lg">{report.defender.name}</span>
                </Link>
            </div>
            <ScrollArea className="flex-grow min-h-0">
                <div className="space-y-4 p-4">
                     <Card className={cn("p-4 text-center", intel ? "bg-green-900/50 border-green-500/50" : "bg-red-900/50 border-red-500/50")}>
                        <h3 className={cn("text-xl font-bold flex items-center justify-center gap-2", intel ? "text-green-400" : "text-red-400")}>
                            {intel ? <CheckCircle /> : <XCircle />}
                            {intel ? "Misión de Espionaje Exitosa" : "Misión de Espionaje Fallida"}
                        </h3>
                    </Card>
                    
                    {intel ? (
                        <Card>
                            <CardHeader><CardTitle>Intel Recopilada</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-lg mb-2">Recursos</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(intel.resources).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-3 bg-muted/50 p-3 rounded-md">
                                                <Image src={resourceIcons[key]} alt={key} width={24} height={24} />
                                                <div>
                                                    <p className="text-xs capitalize text-muted-foreground">{key}</p>
                                                    <p className="font-bold font-mono text-lg">{formatNumber(value)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                     <h4 className="font-semibold text-lg mb-2">Edificios</h4>
                                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                        {sortedBuildings.map(b => (
                                            <div key={b.id} className="flex justify-between items-baseline p-2 border-b">
                                                <span className="truncate pr-2">{b.name}</span>
                                                <span className="font-bold">Nvl {b.level}</span>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                         <p className="text-center text-muted-foreground p-6 border rounded-lg">Tus espías fueron detectados y no se pudo obtener información de la propiedad.</p>
                    )}

                </div>
            </ScrollArea>
             <div className="p-4 pt-4 border-t shrink-0">
                <Button onClick={() => router.back()} className="w-full" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Volver
                </Button>
            </div>
        </div>
    );
}
