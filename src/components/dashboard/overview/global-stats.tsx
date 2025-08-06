
'use client';

import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

interface GlobalStatsProps {
    stats: {
        puntosEntrenamiento: number;
        puntosEdificios: number;
        puntosTropas: number;
        puntosTotales: number;
        propiedades: number;
        lealtad: number;
    }
}

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    href?: string;
}

const StatCard = ({ label, value, subtext, href }: StatCardProps) => (
    <Card className="bg-destructive/80 p-4 text-center text-white transition-all hover:bg-destructive/90 hover:-translate-y-1">
        <div className="text-sm font-semibold uppercase tracking-wider opacity-80">{label}</div>
        <div className="text-3xl font-bold font-mono my-1">{typeof value === 'number' ? formatNumber(value) : value}</div>
        {href ? (
             <Link href={href} className="text-xs text-amber-300 hover:text-amber-400 hover:underline">{subtext}</Link>
        ) : (
             subtext && <div className="text-xs opacity-70">{subtext}</div>
        )}
       
    </Card>
);

export function GlobalStats({ stats }: GlobalStatsProps) {
    const statItems = [
        { label: "Puntos Entrenamiento", value: stats.puntosEntrenamiento },
        { label: "Puntos Edificios", value: stats.puntosEdificios },
        { label: "Puntos Tropas", value: stats.puntosTropas },
        { label: "Puntos Totales", value: stats.puntosTotales },
        { label: "Propiedades", value: stats.propiedades },
        { label: "Lealtad", value: `${Math.round(stats.lealtad)}%`, subtext: "Ver honor", href: "/powerattack" }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statItems.map(item => (
                <StatCard key={item.label} {...item} />
            ))}
        </div>
    )
}
