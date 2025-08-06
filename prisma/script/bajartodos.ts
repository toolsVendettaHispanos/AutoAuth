// prisma/script/bajartodos.ts
import { PrismaClient } from '@prisma/client';
import { bajarModelo, modelNames } from './bajar';

const prisma = new PrismaClient();

async function main() {
  console.log('\ud83d\ude80 Iniciando la descarga de todos los datos de la base de datos...');
  
  try {
    for (const modelName of modelNames) {
      await bajarModelo(modelName as keyof typeof prisma);
    }
    console.log('\n\ud83c\udf89 \u00a1Todos los datos han sido bajados exitosamente!');
  } catch (error) {
    console.error('\n\ud83d\uded1 El proceso de descarga de datos se detuvo debido a un error.');
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
