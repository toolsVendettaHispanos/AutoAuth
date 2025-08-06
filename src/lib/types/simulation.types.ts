


import type { ConfiguracionTropa, TropaBonusContrincante } from '@prisma/client';

// --- INPUT TYPES ---
export interface TroopData {
    id: string;
    quantity: number;
}

export interface TrainingData {
    id: string;
    level: number;
}

export interface DefenseData {
    id: string;
    level: number;
}

export interface SimulationInput {
    troops: TroopData[];
    trainings: TrainingData[];
    defenses: DefenseData[];
    buildingsLevel: number;
    propertyCount: number;
}

// --- BATTLE LOGIC INTERNAL TYPES ---
export interface ArmyUnit {
    id: string;
    nombre: string;
    config: ConfiguracionTropa & { bonusContrincante: TropaBonusContrincante[] };
    quantity: number;
    attack: number;
    defense: number;
    capacidad: number;
}

// --- OUTPUT REPORT TYPES ---
export interface RoundParticipantReport {
    troops: {
        id: string;
        nombre: string;
        initialQuantity: number;
        lostQuantity: number;
    }[];
    totalAttack: number;
    totalAttackConBonus: number;
    poderAtaquePercent: number;
    totalDefense: number;
}

export interface BattleRound {
    round: number;
    attacker: RoundParticipantReport;
    defender: RoundParticipantReport;
}

export interface ResourceCost {
    armas: number;
    municion: number;
    dolares: number;
    alcohol: number;
}

export interface CombatStats {
    attacker: {
        troopsLost: number;
        pointsLost: number;
        resourcesLost: ResourceCost;
        lootedResources?: ResourceCost;
    };
    defender: {
        troopsLost: number;
        pointsLost: number;
        resourcesLost: ResourceCost;
    };
}
export interface BattleReport {
    winner: 'attacker' | 'defender' | 'draw';
    rounds: BattleRound[];
    finalMessage: string;
    finalStats: CombatStats;
}

export interface EspionageReportDetails {
    combat: BattleReport;
    intel: {
        resources: {
            armas: number;
            municion: number;
            alcohol: number;
            dolares: number;
        };
        buildings: {
            id: string;
            name: string;
            level: number;
        }[];
    } | null;
}
