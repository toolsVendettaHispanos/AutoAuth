// prisma/script/utils.ts
import { Prisma } from '@prisma/client';

/**
 * Serializa los datos de la base de datos a un formato JSON compatible.
 * Convierte BigInt a string.
 */
export function serializeData(data: any[]): string {
  return JSON.stringify(
    data,
    (key, value) => (typeof value === 'bigint' ? value.toString() : value),
    2
  );
}

/**
 * Deserializa los datos desde un archivo JSON, convirtiendo los tipos necesarios.
 * Convierte strings de fecha a objetos Date y strings numéricos a BigInt donde sea necesario.
 * @param modelName - El nombre del modelo de Prisma.
 * @param jsonData - El array de objetos JSON.
 * @returns Un array de datos listos para ser insertados en la base de datos.
 */
export function deserializeData(modelName: string, jsonData: any[]): any[] {
  const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name === modelName)?.fields;
  if (!modelFields) {
    throw new Error(`Modelo ${modelName} no encontrado en el DMMF de Prisma.`);
  }

  const dateFields = new Set(modelFields.filter(f => f.type === 'DateTime').map(f => f.name));
  const bigIntFields = new Set(modelFields.filter(f => f.type === 'BigInt').map(f => f.name));

  return jsonData.map(record => {
    const newRecord: { [key: string]: any } = {};
    for (const key in record) {
      if (dateFields.has(key) && record[key]) {
        newRecord[key] = new Date(record[key]);
      } else if (bigIntFields.has(key) && record[key] !== null) {
        newRecord[key] = BigInt(record[key]);
      } else {
        newRecord[key] = record[key];
      }
    }
    return newRecord;
  });
}
