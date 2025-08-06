
// This component is no longer used and can be removed.
// The logic has been broken down into smaller server components
// in the src/components/dashboard/overview/ directory.
// The composition now happens in src/app/(dashboard)/overview/page.tsx.
'use client';

import type { UserWithProgress, FullConfiguracionTropa, FullConfiguracionHabitacion } from "@/lib/types";
import { IncomingAttacks } from "./incoming-attacks";
import { PlayerCard } from "./overview/player-card";
import { FamilyCard } from "./overview/family-card";
import { QueueStatusCard } from "./queue-status-card";
import { MissionOverview } from "./overview/mission-overview";
import { GlobalStats } from "./overview/global-stats";

interface OverviewViewProps {
    user: UserWithProgress;
    allRooms: { id: string, nombre: string }[];
    allTroops: FullConfiguracionTropa[];
}

export function OverviewView({ user, allRooms, allTroops }: OverviewViewProps) {
    const components = [
        <div key="player-card" className="lg:col-span-2">
            <PlayerCard user={user} />
        </div>,
        <div key="family-card" className="lg:col-span-2">
            <FamilyCard family={user.familyMember?.family as any} />
        </div>,
        <div key="queue-status" className="lg:col-span-2 xl:col-span-4">
            <QueueStatusCard user={user} allRooms={allRooms} allTroops={allTroops} />
        </div>,
        <div key="global-stats" className="lg:col-span-2 xl:col-span-4">
            <GlobalStats stats={{
                puntosEntrenamiento: user.puntuacion?.puntosEntrenamientos || 0,
                puntosEdificios: user.puntuacion?.puntosHabitaciones || 0,
                puntosTropas: user.puntuacion?.puntosTropas || 0,
                puntosTotales: user.puntuacion?.puntosTotales || 0,
                propiedades: user.propiedades.length,
                lealtad: 100 // Placeholder
            }} />
        </div>,
        <div key="mission-overview" className="lg:col-span-2 xl:col-span-4">
            <MissionOverview missions={user.misiones} incomingAttacks={user.incomingAttacks} allTroops={allTroops}/>
        </div>
    ];

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {components.map((component, index) => (
                <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    {component}
                </div>
            ))}
        </div>
    );
}
