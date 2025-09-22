'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Minus, Plus, Users, BrainCircuit, Building } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { UserWithProgress } from '@/lib/types';
import { useProperty } from '@/contexts/property-context';
import type { SimulatorColumnState } from '../simulator-view';
import type { ConfiguracionTropa, ConfiguracionEntrenamiento, ConfiguracionHabitacion } from '@prisma/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SimulationSetupProps {
    user: UserWithProgress;
    attackerState: SimulatorColumnState;
    setAttackerState: React.Dispatch<React.SetStateAction<SimulatorColumnState>>;
    defenderState: SimulatorColumnState;
    setDefenderState: React.Dispatch<React.SetStateAction<SimulatorColumnState>>;
    troopConfigs: ConfiguracionTropa[];
    trainingConfigs: ConfiguracionEntrenamiento[];
    defenseConfigs: ConfiguracionHabitacion[];
}

interface SimulatorColumnProps {
    title: string;
    state: SimulatorColumnState;
    setState: React.Dispatch<React.SetStateAction<SimulatorColumnState>>;
    troopConfigs: ConfiguracionTropa[];
    trainingConfigs: ConfiguracionEntrenamiento[];
    defenseConfigs: ConfiguracionHabitacion[];
    onLoadData: () => void;
    isDefender?: boolean;
}

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

const Section = ({ title, children, value, icon }: { title: string; children: React.ReactNode; value: string; icon: React.ReactNode }) => (
    <AccordionItem value={value}>
        <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
                {icon}
                {title}
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <div className="space-y-2 pt-2 border-t mt-2">
                {children}
            </div>
        </AccordionContent>
    </AccordionItem>
);


function SimulatorColumn({ title, state, setState, troopConfigs, trainingConfigs, defenseConfigs, onLoadData, isDefender = false }: SimulatorColumnProps) {

    const handleStateChange = (section: keyof Omit<SimulatorColumnState, 'buildingsLevel' | 'propertyCount'>, id: string, value: number) => {
        setState(prev => ({ ...prev, [section]: { ...prev[section], [id]: value } }));
    };

    const handleClear = () => setState({ troops: {}, trainings: {}, defenses: {}, buildingsLevel: 1, propertyCount: 1 });
    
    const troopsToShow = isDefender ? troopConfigs : troopConfigs.filter(t => t.tipo !== 'DEFENSA');

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" onClick={onLoadData}><Upload className="mr-2 h-4 w-4" /> Cargar</Button>
                    <Button variant="ghost" size="icon" onClick={handleClear} className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <Accordion type="multiple" defaultValue={['troops']} className="w-full">
                        <Section title="Unidades" value="troops" icon={<Users className="h-5 w-5 text-primary" />}>
                             {troopsToShow.map(t => (<InputRow key={`${title}-troop-${t.id}`} label={t.nombre} value={state.troops[t.id] || 0} onChange={(val) => handleStateChange('troops', t.id, val)} />))}
                        </Section>
                        {isDefender && (
                            <Section title="Defensas" value="defenses" icon={<Building className="h-5 w-5 text-primary" />}>
                                {defenseConfigs.map(d => (<InputRow key={`${title}-defense-${d.id}`} label={d.nombre} value={state.defenses[d.id] || 0} onChange={(val) => handleStateChange('defenses', d.id, val)} />))}
                            </Section>
                        )}
                        <Section title="Investigaciones" value="trainings" icon={<BrainCircuit className="h-5 w-5 text-primary" />}>
                            {trainingConfigs.map(t => (<InputRow key={`${title}-training-${t.id}`} label={t.nombre} value={state.trainings[t.id] || 0} onChange={(val) => handleStateChange('trainings', t.id, val)} />))}
                        </Section>
                    </Accordion>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

export function SimulationSetup({ user, attackerState, setAttackerState, defenderState, setDefenderState, troopConfigs, trainingConfigs, defenseConfigs }: SimulationSetupProps) {
    const { selectedProperty } = useProperty();
    const isMobile = useIsMobile();

    const handleLoadUserData = (column: 'attacker' | 'defender') => {
        if (!selectedProperty) return;

        const troops = Object.fromEntries(selectedProperty.TropaUsuario.map(t => [t.configuracionTropaId, t.cantidad]));
        const trainings = Object.fromEntries(user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));
        const defenses = Object.fromEntries(selectedProperty.habitaciones.filter(h => defenseConfigs.some(dc => dc.id === h.configuracionHabitacionId)).map(h => [h.configuracionHabitacionId, h.nivel]));

        const newState: SimulatorColumnState = {
            troops,
            trainings,
            defenses: column === 'defender' ? defenses : {},
            buildingsLevel: 1, 
            propertyCount: user.propiedades.length || 1,
        };

        if (column === 'attacker') setAttackerState(newState);
        else setDefenderState(newState);
    };

    const attackerColumn = (
         <SimulatorColumn 
            title="Atacante"
            state={attackerState}
            setState={setAttackerState}
            troopConfigs={troopConfigs}
            trainingConfigs={trainingConfigs}
            defenseConfigs={defenseConfigs}
            onLoadData={() => handleLoadUserData('attacker')}
        />
    );

    const defenderColumn = (
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
    );

    if (isMobile) {
        return (
            <Tabs defaultValue="attacker" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="attacker">Atacante</TabsTrigger>
                    <TabsTrigger value="defender">Defensor</TabsTrigger>
                </TabsList>
                <TabsContent value="attacker" className="mt-4">{attackerColumn}</TabsContent>
                <TabsContent value="defender" className="mt-4">{defenderColumn}</TabsContent>
            </Tabs>
        )
    }
    
    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {attackerColumn}
            {defenderColumn}
        </div>
    )
}
