
import type { User, HabitacionUsuario, EntrenamientoUsuario, TropaUsuario, TropaSeguridadUsuario, ConfiguracionHabitacion, ConfiguracionEntrenamiento, ColaConstruccion, ColaReclutamiento, ConfiguracionTropa as PrismaConfiguracionTropa, Propiedad, PuntuacionUsuario, ColaMisiones as PrismaColaMisiones, Family, FamilyMember, TrainingRequirement, RoomRequirement, TropaBonusContrincante, Message, BattleReport as PrismaBattleReport, Prisma, ColaEntrenamiento, FamilyInvitation, IncomingAttack as PrismaIncomingAttack, FamilyAnnouncement, EspionageReport as PrismaEspionageReport } from '@prisma/client/edge'
import { BattleReport, EspionageReportDetails, ResourceCost } from './types/simulation.types';

export type PageProps<T extends Record<string, string> = {}> = {
    params: T;
    searchParams?: { [key: string]: string | string[] | undefined };
};

export type IncomingAttack = PrismaIncomingAttack;
export type ColaMisiones = PrismaColaMisiones & { recursos?: ResourceCost | null };
export type ConfiguracionTropa = PrismaConfiguracionTropa & { requisitos: string[] };
export type { ColaConstruccion };
export type { ResourceCost };


export type PropertyWithOwner = Propiedad & {
    user: (User & {
        familyMember: (FamilyMember & { family: Family }) | null;
        puntuacion: { puntosTotales: number } | null
    }) | null
};

export type FullConfiguracionHabitacion = ConfiguracionHabitacion & {
    requisitos: RoomRequirement[];
  };

  export type FullConfiguracionEntrenamiento = ConfiguracionEntrenamiento & {
      requisitos: TrainingRequirement[];
  }

  export type FullConfiguracionTropa = PrismaConfiguracionTropa & {
      bonusContrincante: TropaBonusContrincante[];
      requisitos: string[];
  }

  export type FullHabitacionUsuario = HabitacionUsuario & {
    configuracionHabitacion: FullConfiguracionHabitacion
  };

  export type FullColaReclutamiento = ColaReclutamiento & {
    tropaConfig: ConfiguracionTropa;
  };

  export type FullColaEntrenamiento = ColaEntrenamiento & {
      entrenamiento: ConfiguracionEntrenamiento;
      propiedad: { nombre: string };
  }

  export type FullTropaUsuario = TropaUsuario & {
      configuracionTropa: ConfiguracionTropa;
  }

  export type FullTropaSeguridadUsuario = TropaSeguridadUsuario & {
      configuracionTropa: ConfiguracionTropa;
  }

  export type FullPropiedad = Propiedad & {
      habitaciones: FullHabitacionUsuario[];
      colaConstruccion: ColaConstruccion[];
      colaReclutamiento: FullColaReclutamiento | null;
      TropaUsuario: FullTropaUsuario[];
      TropaSeguridadUsuario: FullTropaSeguridadUsuario[];
  }

  export type FullFamilyMember = FamilyMember & {
      user: UserWithProgress;
  };

  export type FullFamilyAnnouncement = FamilyAnnouncement & {
      author: {
          id: string;
          name: string;
          avatarUrl: string | null;
      }
  }

  export type FullFamily = Family & {
      members: FullFamilyMember[];
      announcements: FullFamilyAnnouncement[];
  }

  export type FullMessage = Message & {
      sender: { name: string; id: string, avatarUrl: string | null } | null;
      battleReportId: string | null;
      espionageReportId: string | null;
  }

  export type FullBattleReport = PrismaBattleReport & {
      attacker: { id: string, name: string, avatarUrl: string | null };
      defender: { id: string, name: string, avatarUrl: string | null };
      details: BattleReport;
  }

  export type FullEspionageReport = PrismaEspionageReport & {
    attacker: { id: string, name: string, avatarUrl: string | null };
    defender: { id: string, name: string, avatarUrl: string | null };
    details: EspionageReportDetails;
  }

  export type UserWithProgress = User & {
      propiedades: FullPropiedad[];
      entrenamientos: (EntrenamientoUsuario & { configuracionEntrenamiento: ConfiguracionEntrenamiento })[];
      puntuacion: PuntuacionUsuario | null;
      misiones: ColaMisiones[];
      incomingAttacks: IncomingAttack[];
      colaEntrenamientos: FullColaEntrenamiento[];
      familyMember: (FamilyMember & { family: FullFamily }) | null;
      _count?: {
          receivedMessages?: number;
      }
  };

  export type UserProfileData = User & {
    puntuacion: PuntuacionUsuario | null;
    propiedades: (Propiedad & {
        habitaciones: (HabitacionUsuario & { configuracionHabitacion: ConfiguracionHabitacion })[],
        TropaUsuario: (TropaUsuario & { configuracionTropa: ConfiguracionTropa })[],
        TropaSeguridadUsuario: (TropaSeguridadUsuario & { configuracionTropa: ConfiguracionTropa })[]
    })[];
    familyMember: (FamilyMember & { family: Family }) | null;
}

  export type UserForRanking = User & {
      puntuacion: PuntuacionUsuario | null;
      _count: {
          propiedades: number;
      }
  }

export type FullFamilyInvitation = FamilyInvitation & {
    user: {
        id: string;
        name: string;
        avatarUrl: string | null;
        puntuacion: PuntuacionUsuario | null;
    };
    family: {
        id: string;
        name: string;
        tag: string;
        avatarUrl: string | null;
    }
}

export interface MissionInput {
    origenPropiedadId: string;
    coordinates: {
        ciudad: number;
        barrio: number;
        edificio: number;
    },
    tropas: { id: string, cantidad: number }[];
    tipo: string;
}
