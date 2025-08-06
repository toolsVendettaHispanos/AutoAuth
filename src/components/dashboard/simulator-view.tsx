
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { runBattleSimulation } from '@/lib/actions/simulation.actions';
import type { BattleReport, SimulationInput } from '@/lib/types/simulation.types';
import type { ConfiguracionTropa, ConfiguracionEntrenamiento, ConfiguracionHabitacion } from '@prisma/client';
import { Loader2, Trash2 } from 'lucide-react';
import { UserWithProgress } from '@/lib/types';
import { SimulationSetup } from './simulator/simulation-setup';
import { SimulationReportDisplay } from './simulator/simulation-report-display';

interface SimulatorViewProps {
    user: UserWithProgress;
    troopConfigs: ConfiguracionTropa[];
    trainingConfigs: ConfiguracionEntrenamiento[];
    defenseConfigs: ConfiguracionHabitacion[];
}

export interface SimulatorColumnState {
    troops: Record<string, number>;
    trainings: Record<string, number>;
    defenses: Record<string, number>;
    buildingsLevel: number;
    propertyCount: number;
}

export const initialColumnState: SimulatorColumnState = {
    troops: {},
    trainings: {},
    defenses: {},
    buildingsLevel: 1,
    propertyCount: 1,
};

export function SimulatorView({ user, troopConfigs, trainingConfigs, defenseConfigs }: SimulatorViewProps) {
    const [isPending, startTransition] = useTransition();
    const [attackerState, setAttackerState] = useState<SimulatorColumnState>(initialColumnState);
    const [defenderState, setDefenderState] = useState<SimulatorColumnState>(initialColumnState);
    const [battleReport, setBattleReport] = useState<BattleReport | null>(null);

    const formatSimulationInput = (state: SimulatorColumnState): SimulationInput => {
        return {
            troops: Object.entries(state.troops).filter(([,qty]) => qty > 0).map(([id, quantity]) => ({ id, quantity })),
            trainings: Object.entries(state.trainings).filter(([,lvl]) => lvl > 0).map(([id, level]) => ({ id, level })),
            defenses: Object.entries(state.defenses).filter(([,lvl]) => lvl > 0).map(([id, level]) => ({ id, level })),
            buildingsLevel: state.buildingsLevel,
            propertyCount: state.propertyCount
        };
    };

    const handleSimulate = () => {
        const attackerInput = formatSimulationInput(attackerState);
        const defenderInput = formatSimulationInput(defenderState);
        
        setBattleReport(null); // Clear previous report
        startTransition(async () => {
            const report = await runBattleSimulation(attackerInput, defenderInput);
            setBattleReport(report);
        });
    };
    
    const handleResetAll = () => {
        setAttackerState(initialColumnState);
        setDefenderState(initialColumnState);
        setBattleReport(null);
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sala de Guerra Virtual</h2>
                    <p className="text-muted-foreground">
                        Planifica tus estrategias y calcula los resultados de posibles enfrentamientos.
                    </p>
                </div>
                 <Button onClick={handleResetAll} variant="outline">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reiniciar Simulador
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[75vh]">
                <SimulationSetup 
                     user={user}
                     attackerState={attackerState}
                     setAttackerState={setAttackerState}
                     defenderState={defenderState}
                     setDefenderState={setDefenderState}
                     troopConfigs={troopConfigs}
                     trainingConfigs={trainingConfigs}
                     defenseConfigs={defenseConfigs}
                />
                <SimulationReportDisplay 
                    report={battleReport} 
                    isSimulating={isPending} 
                />
            </div>
            <div className="mt-6">
                 <Button onClick={handleSimulate} disabled={isPending} size="lg" className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Calculando..." : "INICIAR SIMULACIÓN"}
                </Button>
            </div>
        </div>
    );
}
