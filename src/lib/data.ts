

"use server"

import { Prisma, PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { cache } from 'react';
import { calculateStorageCapacity } from './formulas/room-formulas';
import type { FullPropiedad, UserWithProgress, FullBattleReport, FullFamily, FullFamilyInvitation, FullConfiguracionEntrenamiento, FullConfiguracionHabitacion, FullConfiguracionTropa, UserForRanking, UserProfileData, FullMessage, PropertyWithOwner, FullEspionageReport, IncomingAttack, ColaMisiones } from './types';


const prisma = new PrismaClient().$extends(withAccelerate())


// --- FUNCIONES DE ACCESO A DATOS ---
export const getBattleReportById = cache(async (id: string): Promise<FullBattleReport | null> => {
    try {
        const report = await prisma.battleReport.findUnique({
            where: { id },
            include: {
                attacker: { select: { id: true, name: true, avatarUrl: true } },
                defender: { select: { id: true, name: true, avatarUrl: true } },
            }
        });
        return report as FullBattleReport | null;
    } catch (e) {
        console.error("Error fetching battle report by ID", e);
        return null;
    }
});

export const getEspionageReportById = cache(async (id: string): Promise<FullEspionageReport | null> => {
    try {
        const report = await prisma.espionageReport.findUnique({
            where: { id },
            include: {
                attacker: { select: { id: true, name: true, avatarUrl: true } },
                defender: { select: { id: true, name: true, avatarUrl: true } },
            }
        });
        return report as FullEspionageReport | null;
    } catch (e) {
        console.error("Error fetching espionage report by ID", e);
        return null;
    }
});

export const getBattleReportsForUser = cache(async (userId: string): Promise<FullBattleReport[]> => {
    try {
        const reports = await prisma.battleReport.findMany({
            where: {
                OR: [
                    { attackerId: userId },
                    { defenderId: userId },
                ]
            },
            include: {
                attacker: { select: { id: true, name: true, avatarUrl: true } },
                defender: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        });
        return reports as FullBattleReport[];
    } catch(e) {
        console.error("Error fetching battle reports", e);
        return [];
    }
});

export const getEspionageReportsForUser = cache(async (userId: string): Promise<FullEspionageReport[]> => {
    try {
        const reports = await prisma.espionageReport.findMany({
            where: {
                OR: [
                    { attackerId: userId },
                    { defenderId: userId },
                ]
            },
            include: {
                attacker: { select: { id: true, name: true, avatarUrl: true } },
                defender: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        });
        return reports as FullEspionageReport[];
    } catch(e) {
        console.error("Error fetching espionage reports", e);
        return [];
    }
});

export const getRecentBattleReports = cache(async (): Promise<FullBattleReport[]> => {
    try {
        const reports = await prisma.battleReport.findMany({
            include: {
                attacker: { select: { id: true, name: true, avatarUrl: true } },
                defender: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100,
        });
        return reports as FullBattleReport[];
    } catch (e) {
        console.error("Error fetching recent battle reports", e);
        return [];
    }
});


export const getTroopBonusConfig = cache(async () => {
    try {
        const bonusConfig = await prisma.tropaBonusContrincante.findMany();
        return bonusConfig;
    } catch (e) {
        console.error("Error fetching troop bonus config", e);
        return [];
    }
});

export const getMessagesForUser = cache(async (userId: string): Promise<FullMessage[]> => {
    try {
        const messages = await prisma.message.findMany({
            where: { 
                recipientId: userId,
                category: 'JUGADOR' // Solo mensajes de jugadores
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return messages as FullMessage[];
    } catch (e) {
        console.error("Error fetching messages for user", e);
        return [];
    }
});

export const getNotificationFeedForUser = cache(async (userId: string) => {
    try {
        const [messages, battleReports, espionageReports] = await Promise.all([
            getMessagesForUser(userId),
            getBattleReportsForUser(userId),
            getEspionageReportsForUser(userId)
        ]);

        const messageFeed = messages.map(m => ({ ...m, type: 'message' as const }));
        const battleFeed = battleReports.map(b => ({ ...b, type: 'battle' as const }));
        const espionageFeed = espionageReports.map(e => ({ ...e, type: 'espionage' as const }));

        const combinedFeed = [...messageFeed, ...battleFeed, ...espionageFeed];
        
        combinedFeed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return combinedFeed;
    } catch (e) {
        console.error("Error fetching notification feed for user", e);
        return [];
    }
});


export const getFamilyById = cache(async(id: string) => {
    try {
        const family = await prisma.family.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                puntuacion: true,
                                lastSeen: true,
                            }
                        }
                    },
                    orderBy: {
                        user: {
                           puntuacion: {
                             puntosTotales: 'desc'
                           }
                        }
                    }
                },
                announcements: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10
                }
            }
        });
        return family as FullFamily | null;
    } catch (e) {
        console.error("Error fetching family by id", e);
        return null;
    }
});

export const getFamilyByIdWithAllMembersData = cache(async (familyId: string): Promise<FullFamily | null> => {
    try {
        const family = await prisma.family.findUnique({
            where: { id: familyId },
            include: {
                members: {
                    include: {
                        user: {
                            include: {
                                propiedades: {
                                    include: {
                                        habitaciones: { include: { configuracionHabitacion: true } },
                                        TropaUsuario: { include: { configuracionTropa: true } },
                                        TropaSeguridadUsuario: { include: { configuracionTropa: true } }
                                    }
                                },
                                entrenamientos: { include: { configuracionEntrenamiento: true } },
                                puntuacion: true
                            }
                        }
                    },
                     orderBy: {
                        user: {
                           puntuacion: {
                             puntosTotales: 'desc'
                           }
                        }
                    }
                },
                 announcements: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10
                }
            }
        });
        return family as unknown as FullFamily | null;
    } catch (e) {
        console.error("Error fetching full family data by id", e);
        return null;
    }
});

export const getUserFamily = cache(async(userId: string) => {
    try {
        const familyMember = await prisma.familyMember.findUnique({
            where: { userId },
        });
        if (!familyMember) return null;
        return getFamilyById(familyMember.familyId);
    } catch(e) {
        console.error("Error fetching user family", e);
        return null;
    }
});


export const getPropertyOwner = cache(async (coords: { ciudad: number, barrio: number, edificio: number }): Promise<PropertyWithOwner['user'] | null> => {
    try {
        const property = await prisma.propiedad.findUnique({
            where: {
                ciudad_barrio_edificio: coords
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        password: true,
                        title: true,
                        avatarUrl: true,
                        lastSeen: true,
                        createdAt: true,
                        updatedAt: true,
                        puntuacion: {
                            select: {
                                puntosTotales: true
                            }
                        },
                        familyMember: {
                            include: {
                                family: {
                                    select: {
                                        id: true,
                                        name: true,
                                        tag: true,
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return property?.user as UserProfileData | null;
    } catch(e) {
        return null;
    }
});

export const getPropertiesByLocation = cache(async (ciudad: number, barrio: number) => {
    try {
        const properties = await prisma.propiedad.findMany({
            where: {
                ciudad,
                barrio,
            },
            include: {
                user: {
                    include: {
                        familyMember: {
                            include: {
                                family: true
                            }
                        },
                        puntuacion: {
                            select: {
                                puntosTotales: true
                            }
                        }
                    }
                }
            }
        });
        return properties;
    } catch (error) {
        console.error("Error fetching properties by location:", error);
        return [];
    }
});

export const getUsersForRanking = cache(async (skip: number, take: number): Promise<UserForRanking[]> => {
    try {
        const users = await prisma.user.findMany({
            skip,
            take,
            include: {
                puntuacion: true,
                _count: {
                    select: { propiedades: true },
                }
            },
            orderBy: {
                puntuacion: {
                    puntosTotales: 'desc'
                }
            }
        });
        return users as UserForRanking[];
    } catch (error) {
        console.error("Error fetching users for ranking:", error);
        return [];
    }
});

export const getUsersForHonorRanking = cache(async (skip: number, take: number): Promise<UserForRanking[]> => {
    try {
        const users = await prisma.user.findMany({
            skip,
            take,
            include: {
                puntuacion: true,
            },
            orderBy: {
                puntuacion: {
                    puntosHonorTotales: 'desc'
                }
            }
        });
        return users as UserForRanking[];
    } catch (error) {
        console.error("Error fetching users for honor ranking:", error);
        return [];
    }
});

export const getFamiliesForRanking = cache(async (skip: number, take: number): Promise<FullFamily[]> => {
    try {
        const families = await prisma.family.findMany({
            skip,
            take,
            include: {
                members: {
                    include: {
                        user: {
                            include: {
                                puntuacion: true
                            }
                        }
                    }
                },
                announcements: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            }
                        }
                    },
                     orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10
                }
            }
        });
        // You might need to add a sort based on total points in the future
        return families as FullFamily[];
    } catch (error) {
        console.error("Error fetching families for ranking:", error);
        return [];
    }
});

export const getRoomConfigurations = cache(async (): Promise<FullConfiguracionHabitacion[]> => {
  try {
    const roomConfigurations = await prisma.configuracionHabitacion.findMany({
        include: {
            requisitos: true,
        },
      orderBy: { id: 'asc' },
    });
    return roomConfigurations as FullConfiguracionHabitacion[];
  } catch (error) {
    console.error("Error fetching room configurations:", error);
    return [];
  }
});

export const getTroopConfigurations = cache(async (): Promise<FullConfiguracionTropa[]> => {
    try {
        const troopConfigurations = await prisma.configuracionTropa.findMany({
            include: {
                bonusContrincante: true,
            }
        });
        return troopConfigurations as FullConfiguracionTropa[];
    } catch (error) {
        console.error("Error fetching troop configurations:", error);
        return [];
    }
});

export const getTrainingConfigurations = cache(async (): Promise<FullConfiguracionEntrenamiento[]> => {
    try {
        const trainingConfigurations = await prisma.configuracionEntrenamiento.findMany({
            include: {
                requisitos: true
            }
        });
        return trainingConfigurations as FullConfiguracionEntrenamiento[];
    } catch (error) {
        console.error("Error fetching training configurations:", error);
        return [];
    }
});


export const getUsers = cache(async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                familyMember: {
                    select: {
                        familyId: true
                    }
                }
            }
        });
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
});

export const getUserProfileById = cache(async (userId: string): Promise<UserProfileData | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                puntuacion: true,
                propiedades: {
                    include: {
                        habitaciones: {
                            include: {
                                configuracionHabitacion: true,
                            }
                        },
                        TropaUsuario: {
                            include: {
                                configuracionTropa: true,
                            }
                        },
                        TropaSeguridadUsuario: {
                             include: {
                                configuracionTropa: true,
                            }
                        }
                    }
                },
                familyMember: {
                    include: {
                        family: true
                    }
                }
            }
        });
        return user as unknown as UserProfileData;
    } catch(e) {
        console.error(`Error fetching profile for user ${userId}`, e);
        return null;
    }
})

export const getMaximumResourceCapacity = cache(async () => {
    const properties = await prisma.propiedad.findMany({
        include: { habitaciones: { include: { configuracionHabitacion: true } } }
    });
    return [
        { name: "Armas", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).armas)) },
        { name: "Munición", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).municion)) },
        { name: "Alcohol", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).alcohol)) },
        { name: "Dólares", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).dolares)) },
    ];
});

export const getGlobalStatistics = cache(async () => {
    try {
        const [
            allRoomConfigs,
            allTrainingConfigs,
            allTroopConfigs,
            roomStats,
            trainingStats,
            rawTroopStats,
        ] = await Promise.all([
            getRoomConfigurations(),
            getTrainingConfigurations(),
            getTroopConfigurations(),
            prisma.habitacionUsuario.findMany(),
            prisma.entrenamientoUsuario.findMany(),
            prisma.tropaUsuario.findMany({
                where: {
                    propiedad: {
                        isNot: undefined
                    }
                },
                include: {
                    propiedad: {
                        select: {
                            userId: true
                        }
                    }
                }
            }),
        ]);

        const troopStatsMap = new Map<string, number>();
        rawTroopStats.forEach(stat => {
            if (stat.propiedad) {
                const key = `${stat.propiedad.userId}-${stat.configuracionTropaId}`;
                const currentTotal = troopStatsMap.get(key) || 0;
                troopStatsMap.set(key, currentTotal + stat.cantidad);
            }
        });
        
        const troopStats = Array.from(troopStatsMap.entries()).map(([key, total]) => {
            const [userId, configuracionTropaId] = key.split('-');
            return { userId, configuracionTropaId, total };
        });

        return {
            allRoomConfigs,
            allTrainingConfigs,
            allTroopConfigs,
            roomStats,
            trainingStats,
            troopStats,
        };

    } catch (e) {
        console.error("Error fetching global statistics", e);
        throw new Error("Could not fetch global statistics");
    }
});

export const getFamilyRequests = cache(async (familyId: string): Promise<FullFamilyInvitation[]> => {
    try {
        const requests = await prisma.familyInvitation.findMany({
            where: {
                familyId: familyId,
                type: 'REQUEST',
                status: "PENDING",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        puntuacion: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return requests as unknown as FullFamilyInvitation[];
    } catch(e) {
        console.error(`Error fetching requests for family ${familyId}`, e);
        return [];
    }
});


export const getInvitationsForUser = cache(async (userId: string): Promise<FullFamilyInvitation[]> => {
    try {
        const invitations = await prisma.familyInvitation.findMany({
            where: {
                userId: userId,
                status: "PENDING",
            },
            include: {
                family: {
                    select: {
                        id: true,
                        name: true,
                        tag: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return invitations as unknown as FullFamilyInvitation[];
    } catch(e) {
        console.error(`Error fetching invitations for user ${userId}`, e);
        return [];
    }
});

function getTroopsInMissions(missions: ColaMisiones[]): Map<string, number> {
  const troopMap = new Map<string, number>();
  missions.forEach(mission => {
    const tropas = mission.tropas as { id: string; cantidad: number }[];
    tropas.forEach(tropa => {
      troopMap.set(tropa.id, (troopMap.get(tropa.id) || 0) + tropa.cantidad);
    });
  });
  return troopMap;
}

export const getUserWithProgressByUsername = cache(async (username: string): Promise<UserWithProgress | null> => {
    const userInclude = {
        propiedades: {
            include: {
                habitaciones: {
                    include: {
                        configuracionHabitacion: {
                          include: {
                            requisitos: true
                          }
                        }
                    },
                     orderBy: {
                        configuracionHabitacionId: 'asc' as Prisma.SortOrder
                    }
                },
                TropaUsuario: {
                    include: {
                        configuracionTropa: true
                    }
                },
                TropaSeguridadUsuario: {
                    include: {
                        configuracionTropa: true
                    }
                },
                colaConstruccion: {
                    orderBy: {
                        createdAt: 'asc' as Prisma.SortOrder
                    }
                },
                colaReclutamiento: {
                    include: {
                        tropaConfig: true
                    }
                }
            }
        },
        entrenamientos: {
            include: {
                configuracionEntrenamiento: true
            },
            orderBy: {
                configuracionEntrenamientoId: 'asc' as Prisma.SortOrder
            }
        },
        puntuacion: true,
        misiones: {
            orderBy: {
                fechaLlegada: 'asc' as Prisma.SortOrder
            }
        },
        incomingAttacks: {
            orderBy: {
                arrivalTime: 'asc' as Prisma.SortOrder
            }
        },
        colaEntrenamientos: {
            include: {
                entrenamiento: true,
                propiedad: {
                    select: { nombre: true }
                }
            },
            orderBy: {
                fechaFinalizacion: 'asc' as Prisma.SortOrder
            }
        },
        familyMember: {
            include: {
                family: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        lastSeen: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        _count: {
            select: {
                receivedMessages: {
                    where: { isRead: false }
                }
            }
        }
    };

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: userInclude
        });

        if (!user) return null;

        const troopsInMission = getTroopsInMissions(user.misiones);

        if (troopsInMission.size > 0) {
            user.propiedades.forEach(propiedad => {
                propiedad.TropaUsuario.forEach(tropaUsuario => {
                    const inMissionCount = troopsInMission.get(tropaUsuario.configuracionTropaId) || 0;
                    tropaUsuario.cantidad = Math.max(0, tropaUsuario.cantidad - inMissionCount);
                });
            });
        }
        
        return user as UserWithProgress | null;
    } catch (error) {
        console.error(`Error fetching user ${username} with progress:`, error);
        return null;
    }
});

export const getPlayerCardData = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { 
        id: true,
        name: true, 
        title: true, 
        avatarUrl: true, 
        puntuacion: true, 
        lastSeen: true,
        familyMember: {
            include: {
                family: true
            }
        }
    },
  });
});

export const getQueueStatusData = cache(async (propertyId: string) => {
  return prisma.propiedad.findUnique({
    where: { id: propertyId },
    select: {
      colaConstruccion: { orderBy: { createdAt: 'asc' } },
      colaReclutamiento: { include: { tropaConfig: true } },
    },
  });
});

export const getIncomingAttacksData = cache(async (userId: string): Promise<IncomingAttack[]> => {
    return prisma.incomingAttack.findMany({
        where: { defenderId: userId },
        orderBy: { arrivalTime: 'asc' },
    });
});

export const getFamilyCardData = cache(async (userId: string) => {
    const familyMember = await prisma.familyMember.findUnique({
        where: { userId },
        include: {
            family: {
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatarUrl: true,
                                    puntuacion: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    return familyMember?.family ?? null;
});

export const getMissionsData = cache(async (userId: string) => {
    return prisma.colaMisiones.findMany({
        where: { userId },
        orderBy: {
            fechaLlegada: 'asc',
        },
    });
});

export const getGlobalStatsData = cache(async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            puntuacion: true,
            entrenamientos: {
                where: {
                    configuracionEntrenamientoId: 'honor'
                },
                select: {
                    nivel: true
                }
            },
            _count: {
                select: {
                    propiedades: true
                }
            }
        }
    });
});
