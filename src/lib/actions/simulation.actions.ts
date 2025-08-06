


'use server';

import { getTrainingConfigurations, getTroopConfigurations } from '../data';
import { calcularPoderAtaque } from '../formulas/score-formulas';
import { calcularStatsTropaConBonus } from '../formulas/troop-formulas';
import type { ConfiguracionTropa } from '@prisma/client';
import type { ArmyUnit, BattleReport, CombatStats, ResourceCost, SimulationInput, TroopData } from '../types/simulation.types';


function calculateResourceLoss(lostTroops: ArmyUnit[], troopConfigsMap: Map<string, ConfiguracionTropa>): ResourceCost {
    return lostTroops.reduce((total, unit) => {
        const config = troopConfigsMap.get(unit.id);
        if(config) {
            total.armas += Number(config.costoArmas) * unit.quantity;
            total.municion += Number(config.costoMunicion) * unit.quantity;
            total.dolares += Number(config.costoDolares) * unit.quantity;
            total.alcohol += 0; // Assuming troops don't cost alcohol to replace
        }
        return total;
    }, { armas: 0, municion: 0, dolares: 0, alcohol: 0 });
}

export async function runBattleSimulation(attacker: SimulationInput, defender: SimulationInput): Promise<BattleReport> {
    const [troopConfigs, trainingConfigs] = await Promise.all([
        getTroopConfigurations(),
        getTrainingConfigurations()
    ]);
    const troopConfigsMap = new Map(troopConfigs.map(t => [t.id, t]));
    const trainingConfigsMap = new Map(trainingConfigs.map(t => [t.id, t]));

    const buildArmy = (simInput: SimulationInput): ArmyUnit[] => {
        const userTrainings = simInput.trainings.map(t => ({
            configuracionEntrenamientoId: t.id,
            nivel: t.level,
            configuracion: trainingConfigsMap.get(t.id)!,
        }));

        return (simInput.troops).map((troop: TroopData) => {
            const config = troopConfigsMap.get(troop.id);
            if (!config) return null;
            const { ataqueActual, defensaActual } = calcularStatsTropaConBonus(config, userTrainings as any);
            return {
                id: troop.id,
                nombre: config.nombre,
                config: config,
                quantity: troop.quantity,
                attack: ataqueActual,
                defense: defensaActual,
            };
        }).filter((u): u is ArmyUnit => u !== null && u.quantity > 0);
    };

    const attackerArmy = buildArmy(attacker);
    const defenderArmy = buildArmy(defender);
    
    const bigIntReplacer = (key: string, value: unknown) => typeof value === 'bigint' ? value.toString() : value;

    const initialAttackerArmy: ArmyUnit[] = JSON.parse(JSON.stringify(attackerArmy, bigIntReplacer));
    const initialDefenderArmy: ArmyUnit[] = JSON.parse(JSON.stringify(defenderArmy, bigIntReplacer));

    const honorAtacante = attacker.trainings.find(t => t.id === 'honor')?.level || 0;
    const honorDefensor = defender.trainings.find(t => t.id === 'honor')?.level || 0;
    
    const poderAtaqueAtacantePercent = await calcularPoderAtaque(attacker.propertyCount, honorAtacante);
    const poderAtaqueDefensorPercent = await calcularPoderAtaque(defender.propertyCount, honorDefensor);

    const battleRounds = [];
    let finalMessage = "";
    
    for (let i = 1; i <= 5; i++) {
        const attackerTroopCount = attackerArmy.reduce((sum, u) => sum + u.quantity, 0);
        const defenderTroopCount = defenderArmy.reduce((sum, u) => sum + u.quantity, 0);

        if (attackerTroopCount === 0 || defenderTroopCount === 0) break;

        const roundAttackerArmyBefore = JSON.parse(JSON.stringify(attackerArmy, bigIntReplacer));
        const roundDefenderArmyBefore = JSON.parse(JSON.stringify(defenderArmy, bigIntReplacer));
        const attackerLossesThisRound = new Map<string, number>();
        const defenderLossesThisRound = new Map<string, number>();

        const attackerTotalAttackBase = attackerArmy.reduce((sum, u) => sum + u.attack * u.quantity, 0);
        const defenderTotalAttackBase = defenderArmy.reduce((sum, u) => sum + u.attack * u.quantity, 0);
        
        const attackerTotalAttackConBonus = attackerTotalAttackBase * (poderAtaqueAtacantePercent / 100);
        const defenderTotalAttackConBonus = defenderTotalAttackBase * (poderAtaqueDefensorPercent / 100);

        const attackerTotalDefense = attackerArmy.reduce((sum, u) => sum + u.defense * u.quantity, 0) * (poderAtaqueAtacantePercent / 100);
        const defenderTotalDefense = defenderArmy.reduce((sum, u) => sum + u.defense * u.quantity, 0) * (poderAtaqueDefensorPercent / 100);

        const attackerLossRatio = defenderTotalAttackConBonus > attackerTotalDefense ? 1 : defenderTotalAttackConBonus / (attackerTotalDefense || 1);
        const defenderLossRatio = attackerTotalAttackConBonus > defenderTotalDefense ? 1 : attackerTotalAttackConBonus / (defenderTotalDefense || 1);
        
        attackerArmy.forEach(u => {
            const losses = Math.floor(u.quantity * attackerLossRatio);
            attackerLossesThisRound.set(u.id, (attackerLossesThisRound.get(u.id) || 0) + losses);
            u.quantity -= losses;
        });

        defenderArmy.forEach(u => {
            const losses = Math.floor(u.quantity * defenderLossRatio);
            defenderLossesThisRound.set(u.id, (defenderLossesThisRound.get(u.id) || 0) + losses);
            u.quantity -= losses;
        });
        
        battleRounds.push({
            round: i,
            attacker: {
                troops: roundAttackerArmyBefore.map((t: ArmyUnit) => ({
                    id: t.id,
                    nombre: t.nombre,
                    initialQuantity: t.quantity,
                    lostQuantity: attackerLossesThisRound.get(t.id) || 0,
                })),
                totalAttack: attackerTotalAttackBase,
                totalAttackConBonus: attackerTotalAttackConBonus,
                poderAtaquePercent: poderAtaqueAtacantePercent,
                totalDefense: attackerTotalDefense
            },
            defender: {
                 troops: roundDefenderArmyBefore.map((t: ArmyUnit) => ({
                    id: t.id,
                    nombre: t.nombre,
                    initialQuantity: t.quantity,
                    lostQuantity: defenderLossesThisRound.get(t.id) || 0,
                })),
                totalAttack: defenderTotalAttackBase,
                totalAttackConBonus: defenderTotalAttackConBonus,
                poderAtaquePercent: poderAtaqueDefensorPercent,
                totalDefense: defenderTotalDefense,
            },
        });
    }

    if (battleRounds.length === 0) {
        // Handle case where no rounds were fought (e.g., one side had no troops)
        battleRounds.push({
            round: 0,
             attacker: {
                troops: initialAttackerArmy.map((t: ArmyUnit) => ({
                    id: t.id,
                    nombre: t.nombre,
                    initialQuantity: t.quantity,
                    lostQuantity: 0,
                })),
                totalAttack: 0,
                totalAttackConBonus: 0,
                poderAtaquePercent: 100,
                totalDefense: 0
            },
            defender: {
                 troops: initialDefenderArmy.map((t: ArmyUnit) => ({
                    id: t.id,
                    nombre: t.nombre,
                    initialQuantity: t.quantity,
                    lostQuantity: 0,
                })),
                totalAttack: 0,
                totalAttackConBonus: 0,
                poderAtaquePercent: 100,
                totalDefense: 0,
            },
        });
    }


    const finalAttackerTroops = new Map(attackerArmy.map(u => [u.id, u.quantity]));
    const finalDefenderTroops = new Map(defenderArmy.map(u => [u.id, u.quantity]));
    
    const totalAttackerLossesArray: ArmyUnit[] = initialAttackerArmy.map((u: ArmyUnit) => ({ ...u, quantity: u.quantity - (finalAttackerTroops.get(u.id) || 0)}));
    const totalDefenderLossesArray: ArmyUnit[] = initialDefenderArmy.map((u: ArmyUnit) => ({...u, quantity: u.quantity - (finalDefenderTroops.get(u.id) || 0)}));

    const finalStats: CombatStats = {
        attacker: {
            troopsLost: totalAttackerLossesArray.reduce((s, u) => s + u.quantity, 0),
            pointsLost: totalAttackerLossesArray.reduce((s, u) => s + (u.config.puntos || 0) * u.quantity, 0),
            resourcesLost: calculateResourceLoss(totalAttackerLossesArray, troopConfigsMap)
        },
        defender: {
            troopsLost: totalDefenderLossesArray.reduce((s, u) => s + u.quantity, 0),
            pointsLost: totalDefenderLossesArray.reduce((s, u) => s + (u.config.puntos || 0) * u.quantity, 0),
            resourcesLost: calculateResourceLoss(totalDefenderLossesArray, troopConfigsMap)
        }
    }

    const attackerHasTroops = attackerArmy.some(u => u.quantity > 0);
    const defenderHasTroops = defenderArmy.some(u => u.quantity > 0);
    
    let winner: 'attacker' | 'defender' | 'draw';
    if(attackerHasTroops && !defenderHasTroops) {
        winner = 'attacker';
        finalMessage = "El atacante ha ganado la batalla."
    } else if (!attackerHasTroops && defenderHasTroops) {
        winner = 'defender';
        finalMessage = "El defensor ha repelido el ataque."
    } else if (!attackerHasTroops && !defenderHasTroops) {
        winner = 'draw';
        finalMessage = "Aniquilación mutua. Nadie sobrevive."
    } else {
        winner = 'draw';
        finalMessage = "La batalla ha terminado en empate tras 5 rondas.";
    }

    return { winner, rounds: battleRounds, finalStats, finalMessage };
}
