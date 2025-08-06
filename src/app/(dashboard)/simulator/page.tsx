
'use client';

import React, { useEffect, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTroopConfigurations, getTrainingConfigurations, getRoomConfigurations } from "@/lib/data";
import { SimulatorView } from "@/components/dashboard/simulator-view";
import { BattleReportDisplay } from "@/components/dashboard/brawls/battle-report-display";
import type { BattleReport } from '@/lib/types/simulation.types';
import type { UserWithProgress, FullConfiguracionTropa, FullConfiguracionEntrenamiento, FullConfiguracionHabitacion } from "@/lib/types";

function SimulatorLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
        </div>
    )
}

export default function SimulatorPage() {
    const [user, setUser] = useState<UserWithProgress | null>(null);
    const [troopConfigs, setTroopConfigs] = useState<FullConfiguracionTropa[]>([]);
    const [trainingConfigs, setTrainingConfigs] = useState<FullConfiguracionEntrenamiento[]>([]);
    const [defenseConfigs, setDefenseConfigs] = useState<FullConfiguracionHabitacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [battleReport, setBattleReport] = useState<BattleReport | null>(null);

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
        <div className="main-view">
            <Suspense fallback={<SimulatorLoading />}>
                <SimulatorView 
                    user={user}
                    troopConfigs={troopConfigs}
                    trainingConfigs={trainingConfigs}
                    defenseConfigs={defenseConfigs}
                    onSimulationComplete={setBattleReport}
                />
                {battleReport && <BattleReportDisplay report={battleReport} />}
            </Suspense>
        </div>
    );
}
