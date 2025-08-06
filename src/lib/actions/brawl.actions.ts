


'use server'

import prisma from "../prisma/prisma";
import { runBattleSimulation } from "./simulation.actions";
import { ColaMisiones, MessageCategory } from "@prisma/client";
import type { SimulationInput, BattleReport, ResourceCost } from "../types/simulation.types";
import { getTroopConfigurations } from "../data";
import { calculateSafeStorage } from "../formulas/room-formulas";

export async function handleAttackMission(mision: ColaMisiones) {
    const atacante = await prisma.user.findUnique({ 
        where: { id: mision.userId },
        include: {
            propiedades: { include: { TropaUsuario: true } },
            entrenamientos: true,
        }
    });
    if (!atacante) {
        console.error("Atacante no encontrado para la misión:", mision.id);
        await prisma.colaMisiones.delete({ where: { id: mision.id } });
        return;
    }

    const propiedadDefensora = await prisma.propiedad.findUnique({
        where: {
            ciudad_barrio_edificio: {
                ciudad: mision.destinoCiudad,
                barrio: mision.destinoBarrio,
                edificio: mision.destinoEdificio,
            }
        },
        include: {
            habitaciones: {
                include: {
                    configuracionHabitacion: true
                }
            },
            user: true,
        }
    });

    if (!propiedadDefensora || !propiedadDefensora.userId) {
        await prisma.colaMisiones.update({
            where: { id: mision.id },
            data: { 
                tipoMision: 'REGRESO',
                fechaRegreso: new Date(new Date().getTime() + mision.duracionViaje * 1000)
            }
        });
        return;
    }

    const defensor = await prisma.user.findUnique({
        where: { id: propiedadDefensora.userId },
        include: {
            propiedades: {
                include: {
                    TropaUsuario: { include: { configuracionTropa: true } },
                    TropaSeguridadUsuario: { include: { configuracionTropa: true } }
                }
            },
            entrenamientos: true,
        }
    });
    
    if (!defensor) {
        console.error("Defensor no encontrado para la propiedad:", propiedadDefensora.id);
         await prisma.colaMisiones.update({
            where: { id: mision.id },
            data: { 
                tipoMision: 'REGRESO',
                fechaRegreso: new Date(new Date().getTime() + mision.duracionViaje * 1000)
            }
        });
        return;
    }
    
    const attackerTroops = (mision.tropas as any[]).map(t => ({ id: t.id, quantity: t.cantidad }));

    const attackerInput: SimulationInput = {
        troops: attackerTroops,
        trainings: atacante.entrenamientos.map(t => ({ id: t.configuracionEntrenamientoId, level: t.nivel })),
        defenses: [],
        buildingsLevel: 1, 
        propertyCount: atacante.propiedades.length,
    };

    const defenderInput: SimulationInput = {
        troops: defensor.propiedades.flatMap(p => [...p.TropaUsuario, ...p.TropaSeguridadUsuario].map(t => ({ id: t.configuracionTropa.id, quantity: t.cantidad }))),
        trainings: defensor.entrenamientos.map(t => ({ id: t.configuracionEntrenamientoId, level: t.nivel })),
        defenses: [], 
        buildingsLevel: 1,
        propertyCount: defensor.propiedades?.length || 1
    };

    const report = await runBattleSimulation(attackerInput, defenderInput) as BattleReport;
    
    let tropaRegreso: { id: string, cantidad: number }[];
    let recursosSaqueados: ResourceCost | null = null;

    if (report.rounds.length > 0) {
        tropaRegreso = report.rounds[report.rounds.length - 1].attacker.troops
            .map(t => ({ id: t.id, cantidad: t.initialQuantity - t.lostQuantity }))
            .filter(t => t.cantidad > 0);
    } else {
        tropaRegreso = (mision.tropas as any[]).map(t => ({ id: t.id, cantidad: t.cantidad }));
    }
    
    if (report.winner === 'attacker') {
        const troopConfigs = await getTroopConfigurations();
        const troopConfigsMap = new Map(troopConfigs.map(t => [t.id, t]));

        const survivingTroops = tropaRegreso;

        const totalCapacity = survivingTroops.reduce((sum, troop) => {
            const config = troopConfigsMap.get(troop.id);
            return sum + ((config?.capacidad || 0) * troop.cantidad);
        }, 0);

        const safeStorage = calculateSafeStorage(propiedadDefensora as any);

        const lootableResources: ResourceCost = {
            armas: Math.max(0, Number(propiedadDefensora.armas) - safeStorage.armas),
            municion: Math.max(0, Number(propiedadDefensora.municion) - safeStorage.municion),
            dolares: Math.max(0, Number(propiedadDefensora.dolares) - safeStorage.dolares),
            alcohol: Math.max(0, Number(propiedadDefensora.alcohol) - safeStorage.alcohol),
        };

        const totalLootable = Object.values(lootableResources).reduce((sum, val) => sum + val, 0);
        const totalToLoot = Math.min(totalCapacity, totalLootable);
        
        const lootedResources: ResourceCost = { armas: 0, municion: 0, dolares: 0, alcohol: 0 };

        if (totalToLoot > 0) {
            const lootableTypes = Object.entries(lootableResources).filter(([, val]) => val > 0);
            const lootPerType = totalToLoot / lootableTypes.length;

            lootableTypes.forEach(([key]) => {
                const resourceKey = key as keyof ResourceCost;
                const amount = Math.min(lootableResources[resourceKey], lootPerType);
                lootedResources[resourceKey] = Math.floor(amount);
            });
        }
        
        report.finalStats.attacker.lootedResources = lootedResources;
        recursosSaqueados = lootedResources;
    }


    const bigIntReplacer = (key: any, value: any) => typeof value === 'bigint' ? value.toString() : value;
    const serializableReport = JSON.parse(JSON.stringify(report, bigIntReplacer));

    const honorGanadoAtacante = report.finalStats.defender.pointsLost;
    const honorGanadoDefensor = report.finalStats.attacker.pointsLost;

    await prisma.$transaction(async (tx) => {
        const battleReport = await tx.battleReport.create({
            data: {
                attackerId: atacante.id,
                defenderId: defensor.id,
                winner: report.winner,
                details: serializableReport,
                ciudad: mision.destinoCiudad,
                barrio: mision.destinoBarrio,
                edificio: mision.destinoEdificio,
            }
        });

        if (report.rounds.length > 0) {
            for (const troop of report.rounds[report.rounds.length - 1].defender.troops) {
                if (troop.lostQuantity > 0) {
                     await tx.tropaUsuario.updateMany({
                        where: { 
                            propiedad: { userId: defensor.id },
                            configuracionTropaId: troop.id 
                        },
                        data: { cantidad: { decrement: troop.lostQuantity } }
                    });
                    await tx.tropaSeguridadUsuario.updateMany({
                        where: {
                            propiedad: { userId: defensor.id },
                            configuracionTropaId: troop.id
                        },
                        data: { cantidad: { decrement: troop.lostQuantity } }
                    });
                }
            }
        }
        
        if (report.finalStats.attacker.lootedResources) {
            const loot = report.finalStats.attacker.lootedResources;
            await tx.propiedad.update({
                where: { id: propiedadDefensora.id },
                data: {
                    armas: { decrement: BigInt(loot.armas) },
                    municion: { decrement: BigInt(loot.municion) },
                    dolares: { decrement: BigInt(loot.dolares) },
                    alcohol: { decrement: BigInt(loot.alcohol) },
                }
            });
        }
        
        await tx.colaMisiones.update({
            where: { id: mision.id },
            data: {
                tipoMision: 'REGRESO',
                tropas: tropaRegreso as any,
                recursos: recursosSaqueados as any,
                fechaRegreso: new Date(new Date().getTime() + mision.duracionViaje * 1000)
            }
        });

        await tx.puntuacionUsuario.upsert({
            where: { userId: atacante.id },
            update: {
                puntosHonorAtacante: { increment: honorGanadoAtacante },
                puntosHonorTotales: { increment: honorGanadoAtacante }
            },
            create: {
                userId: atacante.id,
                puntosHonorAtacante: honorGanadoAtacante,
                puntosHonorTotales: honorGanadoAtacante,
                 puntosHabitaciones: 0,
                puntosTropas: 0,
                puntosEntrenamientos: 0,
                puntosTotales: 0,
            }
        });

        await tx.puntuacionUsuario.upsert({
            where: { userId: defensor.id },
            update: {
                puntosHonorDefensor: { increment: honorGanadoDefensor },
                puntosHonorTotales: { increment: honorGanadoDefensor }
            },
            create: {
                userId: defensor.id,
                puntosHonorDefensor: honorGanadoDefensor,
                puntosHonorTotales: honorGanadoDefensor,
                 puntosHabitaciones: 0,
                puntosTropas: 0,
                puntosEntrenamientos: 0,
                puntosTotales: 0,
            }
        });


        await tx.message.create({
            data: {
                recipientId: atacante.id,
                subject: `Resultado de la batalla en ${mision.destinoCiudad}:${mision.destinoBarrio}`,
                content: `Tu ataque contra ${defensor.name} ha concluido. Revisa tus informes de batalla para ver los detalles.`,
                category: MessageCategory.BATALLA,
                battleReportId: battleReport.id,
            }
        });
        
        await tx.message.create({
            data: {
                recipientId: defensor.id,
                subject: `Has sido atacado en ${mision.destinoCiudad}:${mision.destinoBarrio}`,
                content: `Has sido atacado por ${atacante.name}. Revisa tus informes de batalla para ver los detalles.`,
                category: MessageCategory.BATALLA,
                battleReportId: battleReport.id,
            }
        });
    });
}

