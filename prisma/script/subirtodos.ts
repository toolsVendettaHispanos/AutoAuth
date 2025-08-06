// prisma/script/subirtodos.ts
import { PrismaClient } from '@prisma/client';
import { subirModelo } from './subir';

const prisma = new PrismaClient();

// El orden es CRUCIAL para satisfacer las restricciones de clave externa.
// Las tablas sin dependencias van primero, las que dependen de otras van despu\u00e9s.
const UPLOAD_ORDER = [
  // Configuraciones base
  'ConfiguracionHabitacion',
  'ConfiguracionEntrenamiento',
  'ConfiguracionTropa',
  
  // Entidades principales
  'User',
  'SuperUser',
  'Family',
  
  // Entidades que dependen de las principales
  'FamilyMember',
  'FamilyInvitation',
  'FamilyAnnouncement',
  'Propiedad',
  'PuntuacionUsuario',
  
  // Tablas de uni\u00f3n y datos dependientes
  'HabitacionUsuario',
  'EntrenamientoUsuario',
  'TropaUsuario',
  'TropaSeguridadUsuario',
  
  // Requisitos (dependen de las configuraciones)
  'RoomRequirement',
  'TrainingRequirement',
  'TroopRequirement',
  
  // Datos transaccionales
  'TropaBonusContrincante',
  'BattleReport',
  'EspionageReport',
  'Message',
  'LoginHistory',
  
  // Colas (dependen de casi todo lo anterior)
  'ColaConstruccion',
  'ColaReclutamiento',
  'ColaEntrenamiento',
  'ColaMisiones',
  'IncomingAttack',
];

async function main() {
  console.log('\ud83d\ude80 Iniciando la subida de todos los datos a la base de datos...');
  
  try {
    // Borramos los datos en orden inverso para evitar problemas de foreign keys
    console.log('\n--- Limpiando la base de datos en orden inverso ---');
    for (const modelName of [...UPLOAD_ORDER].reverse()) {
      console.log(`Limpiando ${modelName}...`);
      // @ts-ignore
      await prisma[modelName].deleteMany({});
    }
    console.log('\u2705 Base de datos limpiada.');

    // Subimos los datos en el orden correcto
    console.log('\n--- Subiendo datos en el orden correcto ---');
    for (const modelName of UPLOAD_ORDER) {
      await subirModelo(modelName as keyof typeof prisma);
    }
    console.log('\n\ud83c\udf89 \u00a1Todos los datos han sido subidos exitosamente!');
  } catch (error) {
    console.error('\n\ud83d\uded1 El proceso de subida de datos se detuvo debido a un error.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
