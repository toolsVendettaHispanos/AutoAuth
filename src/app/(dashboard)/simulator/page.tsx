
'use client';

import React, { useEffect, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTroopConfigurations, getTrainingConfigurations, getRoomConfigurations } from "@/lib/data";
import { SimulatorView } from "@/components/dashboard/simulator-view";
import type { BattleReport } from '@/lib/types/simulation.types';
import type { UserWithProgress, FullConfiguracionTropa, FullConfiguracionEntrenamiento, FullConfiguracionHabitacion } from "@/lib/types";

function SimulatorLoading() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-[70vh] w-full" />
                <Skeleton className="h-[70vh] w-full" />
            </div>
            <Skeleton className="h-12 w-full mt-4" />
        </div>
    )
}

// Este componente ahora es necesario para poder usar Suspense
const SimulatorPageContent = () => {
    const [user, setUser] = useState<UserWithProgress | null>(null);
    const [troopConfigs, setTroopConfigs] = useState<FullConfiguracionTropa[]>([]);
    const [trainingConfigs, setTrainingConfigs] = useState<FullConfiguracionEntrenamiento[]>([]);
    const [defenseConfigs, setDefenseConfigs] = useState<FullConfiguracionHabitacion[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            const sessionUser = await getSessionUser();
            if (!sessionUser) {
                redirect('/');
                return;
            }
            setUser(sessionUser);

            const [troops, trainings, rooms] = await Promise.all([
                getTroopConfigurations(),
                getTrainingConfigurations(),
                getRoomConfigurations()
            ]);
            setTroopConfigs(troops);
            setTrainingConfigs(trainings);
            setDefenseConfigs(rooms.filter(r => 
                ['seguridad', 'torreta_de_fuego_automatico', 'minas_ocultas'].includes(r.id)
            ));
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return <SimulatorLoading />;
    }

    if (!user) {
        return null; // or a redirect, handled by useEffect
    }
    
    return (
        <SimulatorView 
            user={user}
            troopConfigs={troopConfigs}
            trainingConfigs={trainingConfigs}
            defenseConfigs={defenseConfigs}
        />
    )
}

export default function SimulatorPage() {
    return (
        <div className="main-view">
            <Suspense fallback={<SimulatorLoading />}>
                <SimulatorPageContent />
            </Suspense>
        </div>
    );
}
