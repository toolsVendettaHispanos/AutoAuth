// prisma/script/bajar.ts
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { serializeData } from './utils';

const prisma = new PrismaClient();

// Obtiene todos los nombres de modelos del esquema de Prisma
export const modelNames = Prisma.dmmf.datamodel.models.map(model => model.name);

/**
 * Baja los datos de una tabla específica y los guarda en un archivo JSON.
 * @param modelName - El nombre del modelo de Prisma (debe coincidir con el schema).
 */
export async function bajarModelo(modelName: keyof typeof prisma) {
  console.log(`Bajando datos de ${modelName}...`);
  try {
    // @ts-ignore - Usamos un acceso dinámico al modelo de Prisma
    const data = await prisma[modelName].findMany();
    
    const outputDir = path.join(process.cwd(), 'prisma', 'datos', 'bajar');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `${modelName}.json`);
    fs.writeFileSync(filePath, serializeData(data));
    
    console.log(`\u2705 Datos de ${modelName} bajados correctamente a ${filePath}`);
  } catch (e) {
    console.error(`\u274c Error bajando datos de ${modelName}:`, e);
    throw e;
  }
}

// Si el script se ejecuta directamente, permite bajar un modelo específico
if (require.main === module) {
  const modelToBackup = process.argv[2];
  if (!modelToBackup || !modelNames.includes(modelToBackup)) {
    console.error(`Por favor, proporciona un nombre de modelo v\u00e1lido. Modelos disponibles: ${modelNames.join(', ')}`);
    process.exit(1);
  }

  bajarModelo(modelToBackup as keyof typeof prisma)
    .catch((e) => {
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
