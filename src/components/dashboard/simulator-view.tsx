
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { runBattleSimulation } from '@/lib/actions/simulation.actions';
import type { BattleReport, SimulationInput } from '@/lib/types/simulation.types';
import type { ConfiguracionTropa, ConfiguracionEntrenamiento, ConfiguracionHabitacion } from '@prisma/client';
import { Loader2, Trash2, Upload, Minus, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from '../ui/scroll-area';
import { UserWithProgress } from '@/lib/types';
import { useProperty } from '@/contexts/property-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { BattleReportDisplay } from '../dashboard/brawls/battle-report-display';
import { QuickReportView } from './simulator/quick-report-view';


interface SimulatorViewProps {
    user: UserWithProgress;
    troopConfigs: ConfiguracionTropa[];
    trainingConfigs: ConfiguracionEntrenamiento[];
    defenseConfigs: ConfiguracionHabitacion[];
    onSimulationComplete: (report: BattleReport | null) => void;
}

interface SimulatorColumnState {
    troops: Record<string, number>;
    trainings: Record<string, number>;
    defenses: Record<string, number>;
    buildingsLevel: number;
    propertyCount: number;
}

const initialColumnState: SimulatorColumnState = {
    troops: {},
    trainings: {},
    defenses: {},
    buildingsLevel: 1,
    propertyCount: 1,
};

const Section = ({ title, children, value }: { title: string; children: React.ReactNode; value: string }) => (
    <AccordionItem value={value}>
        <AccordionTrigger className="text-lg font-semibold text-primary">{title}</AccordionTrigger>
        <AccordionContent>
            <div className="space-y-2 pt-2">
                {children}
            </div>
        </AccordionContent>
    </AccordionItem>
);

const InputRow = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(parseInt(val, 10) || 0);
    };

    return (
        <div className="flex items-center justify-between gap-2">
            <Label htmlFor={label} className="text-sm truncate pr-2 flex-1">{label}</Label>
            <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange(value - 1)}><Minus className="h-4 w-4"/></Button>
                 <Input
                    id={label}
                    type="number"
                    min="0"
                    value={value || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-20 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                 <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange(value + 1)}><Plus className="h-4 w-4"/></Button>
            </div>
        </div>
    );
};

function SimulatorColumn({
    title,
    state,
    setState,
    troopConfigs,
    trainingConfigs,
    defenseConfigs,
    onLoadData,
    isDefender = false,
}: {
    title: string;
    state: SimulatorColumnState;
    setState: React.Dispatch<React.SetStateAction<SimulatorColumnState>>;
    troopConfigs: ConfiguracionTropa[];
    trainingConfigs: ConfiguracionEntrenamiento[];
    defenseConfigs: ConfiguracionHabitacion[];
    onLoadData: () => void;
    isDefender?: boolean;
}) {

    const handleStateChange = (
        section: keyof Omit<SimulatorColumnState, 'buildingsLevel' | 'propertyCount'>,
        id: string,
        value: number
    ) => {
        setState(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [id]: value
            }
        }));
    };

     const handleGeneralValueChange = (field: 'buildingsLevel' | 'propertyCount', value: number) => {
         setState(prev => ({ ...prev, [field]: value }));
    }

    const handleClear = () => {
        setState(initialColumnState);
    }
    
    const troopsToShow = isDefender ? troopConfigs : troopConfigs.filter(t => t.tipo !== 'DEFENSA');


    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" onClick={onLoadData}>
                        <Upload className="mr-2 h-4 w-4" />
                        Cargar mis datos
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleClear} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Limpiar {title}</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-96 pr-4">
                    <Accordion type="multiple" defaultValue={['troops']} className="w-full">
                        <Section title="Tropas" value="troops">
                             {troopsToShow.map(t => (
                                <InputRow
                                    key={`${title}-troop-${t.id}`}
                                    label={t.nombre}
                                    value={state.troops[t.id] || 0}
                                    onChange={(val) => handleStateChange('troops', t.id, val)}
                                />
                             ))}
                        </Section>
                        {isDefender && (
                            <Section title="Defensas Estructurales" value="defenses">
                                {defenseConfigs.map(d => (
                                    <InputRow
                                        key={`${title}-defense-${d.id}`}
                                        label={d.nombre}
                                        value={state.defenses[d.id] || 0}
                                        onChange={(val) => handleStateChange('defenses', d.id, val)}
                                    />
                                ))}
                            </Section>
                        )}
                        <Section title="Entrenamientos" value="trainings">
                            {trainingConfigs.map(t => (
                                <InputRow
                                    key={`${title}-training-${t.id}`}
                                    label={t.nombre}
                                    value={state.trainings[t.id] || 0}
                                    onChange={(val) => handleStateChange('trainings', t.id, val)}
                                />
                            ))}
                        </Section>
                        <Section title="General" value="general">
                             <InputRow
                                label="Nº Propiedades"
                                value={state.propertyCount}
                                onChange={(val) => handleGeneralValueChange('propertyCount', val)}
                            />
                            {isDefender && (
                                <InputRow
                                    label="Nivel Edificios (Defensa)"
                                    value={state.buildingsLevel}
                                    onChange={(val) => handleGeneralValueChange('buildingsLevel', val)}
                                />
                            )}
                        </Section>
                    </Accordion>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export function SimulatorView({ user, troopConfigs, trainingConfigs, defenseConfigs, onSimulationComplete }: SimulatorViewProps) {
    const { selectedProperty } = useProperty();
    const [isPending, startTransition] = useTransition();
    const [attackerState, setAttackerState] = useState<SimulatorColumnState>(initialColumnState);
    const [defenderState, setDefenderState] = useState<SimulatorColumnState>(initialColumnState);
    const [quickReport, setQuickReport] = useState<BattleReport | null>(null);

    const formatSimulationInput = (state: SimulatorColumnState): SimulationInput => {
        return {
            troops: Object.entries(state.troops).filter(([,qty]) => qty > 0).map(([id, quantity]) => ({ id, quantity })),
            trainings: Object.entries(state.trainings).filter(([,lvl]) => lvl > 0).map(([id, level]) => ({ id, level })),
            defenses: Object.entries(state.defenses).filter(([,lvl]) => lvl > 0).map(([id, level]) => ({ id, level })),
            buildingsLevel: state.buildingsLevel,
            propertyCount: state.propertyCount
        };
    };

    const handleLoadUserData = (column: 'attacker' | 'defender') => {
        if (!selectedProperty) return;

        const troops = Object.fromEntries(
            selectedProperty.TropaUsuario.map(t => [t.configuracionTropaId, t.cantidad])
        );

        const trainings = Object.fromEntries(
            user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel])
        );

        const defenses = Object.fromEntries(
            selectedProperty.habitaciones.filter(h => defenseConfigs.some(dc => dc.id === h.configuracionHabitacionId))
            .map(h => [h.configuracionHabitacionId, h.nivel])
        );

        const newState: SimulatorColumnState = {
            troops,
            trainings,
            defenses: column === 'defender' ? defenses : {},
            buildingsLevel: 1, 
            propertyCount: user.propiedades.length || 1,
        };

        if (column === 'attacker') {
            setAttackerState(newState);
        } else {
            setDefenderState(newState);
        }
    }

    const handleSimulate = (detailed: boolean) => {
        const attackerInput = formatSimulationInput(attackerState);
        const defenderInput = formatSimulationInput(defenderState);
        
        startTransition(async () => {
            const report = await runBattleSimulation(attackerInput, defenderInput);
            if (detailed) {
                onSimulationComplete(report);
                setQuickReport(null);
            } else {
                setQuickReport(report);
                onSimulationComplete(null);
            }
        });
    };
    
    const handleResetAll = () => {
        setAttackerState(initialColumnState);
        setDefenderState(initialColumnState);
        onSimulationComplete(null);
        setQuickReport(null);
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Simulador de Batalla</h2>
                    <p className="text-muted-foreground">
                        Calcula los resultados de posibles enfrentamientos.
                    </p>
                </div>
                 <Button onClick={handleResetAll} variant="outline">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reiniciar Simulador
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SimulatorColumn 
                    title="Atacante"
                    state={attackerState}
                    setState={setAttackerState}
                    troopConfigs={troopConfigs}
                    trainingConfigs={trainingConfigs}
                    defenseConfigs={defenseConfigs}
                    onLoadData={() => handleLoadUserData('attacker')}
                />
                <SimulatorColumn 
                    title="Defensor"
                    state={defenderState}
                    setState={setDefenderState}
                    troopConfigs={troopConfigs}
                    trainingConfigs={trainingConfigs}
                    defenseConfigs={defenseConfigs}
                    isDefender
                    onLoadData={() => handleLoadUserData('defender')}
                />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => handleSimulate(false)} disabled={isPending} size="lg">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simular (Vista Rápida)
                </Button>
                 <Button onClick={() => handleSimulate(true)} disabled={isPending} size="lg" variant="secondary">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simular (Vista Detallada)
                </Button>
            </div>

            {quickReport && (
                 <Dialog open={!!quickReport} onOpenChange={(isOpen) => !isOpen && setQuickReport(null)}>
                    <DialogContent className="max-w-2xl bg-black/80 border-primary text-white">
                         <DialogHeader>
                            <DialogTitle className="text-2xl text-center text-primary tracking-widest font-heading">
                                INFORME DE BATALLA RÁPIDO
                            </DialogTitle>
                        </DialogHeader>
                        <QuickReportView report={quickReport} />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button className="w-full bg-red-800 hover:bg-red-700 text-white">Cerrar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
