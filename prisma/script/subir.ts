// prisma/script/subir.ts
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { deserializeData } from './utils';

const prisma = new PrismaClient();

// Obtiene todos los nombres de modelos del esquema de Prisma
export const modelNames = Prisma.dmmf.datamodel.models.map(model => model.name);

/**
 * Sube datos desde un archivo JSON a una tabla específica, borrando los datos antiguos primero.
 * @param modelName - El nombre del modelo de Prisma (debe coincidir con el schema).
 */
export async function subirModelo(modelName: keyof typeof prisma) {
  console.log(`Subiendo datos para ${modelName}...`);
  try {
    const filePath = path.join(process.cwd(), 'prisma', 'datos', 'bajar', `${modelName}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`\u26a0\ufe0f No se encontr\u00f3 el archivo ${modelName}.json, omitiendo.`);
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      console.log(`\u2139\ufe0f El archivo ${modelName}.json est\u00e1 vac\u00edo o no es un array, omitiendo.`);
      return;
    }

    const data = deserializeData(modelName, jsonData);

    // @ts-ignore - Usamos un acceso din\u00e1mico al modelo de Prisma
    await prisma[modelName].deleteMany({});
    // @ts-ignore
    await prisma[modelName].createMany({
      data: data,
    });

    console.log(`\u2705 Datos de ${modelName} subidos correctamente.`);
  } catch (e) {
    console.error(`\u274c Error subiendo datos para ${modelName}:`, e);
    throw e;
  }
}

// Si el script se ejecuta directamente, permite subir un modelo específico
if (require.main === module) {
  const modelToRestore = process.argv[2];
  if (!modelToRestore || !modelNames.includes(modelToRestore)) {
    console.error(`Por favor, proporciona un nombre de modelo v\u00e1lido. Modelos disponibles: ${modelNames.join(', ')}`);
    process.exit(1);
  }

  subirModelo(modelToRestore as keyof typeof prisma)
    .catch((e) => {
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
