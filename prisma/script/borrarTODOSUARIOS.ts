// prisma/script/borrarTODOSUARIOS.ts
import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Función para solicitar confirmación al usuario
const askConfirmation = (question: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'si');
    });
  });
};

async function main() {
  console.log('\x1b[31m%s\x1b[0m', '*****************************************************************');
  console.log('\x1b[31m%s\x1b[0m', '* ADVERTENCIA                           *');
  console.log('\x1b[31m%s\x1b[0m', '* *');
  console.log('\x1b[31m%s\x1b[0m', '* Este script borrará permanentemente a TODOS los usuarios    *');
  console.log('\x1b[31m%s\x1b[0m', '* y TODOS sus datos relacionados (propiedades, tropas,        *');
  console.log('\x1b[31m%s\x1b[0m', '* mensajes, informes, etc.). Esta acción NO se puede deshacer. *');
  console.log('\x1b[31m%s\x1b[0m', '*****************************************************************');
  
  const confirmed = await askConfirmation(
    '\n\u00bfEst\u00e1s absolutamente seguro de que quieres continuar? Escribe "si" para confirmar: '
  );

  if (!confirmed) {
    console.log('\nOperaci\u00f3n cancelada por el usuario.');
    return;
  }

  console.log('\nIniciando el proceso de borrado...');
  
  try {
    // Gracias a `onDelete: Cascade` en el schema, Prisma se encargar\u00e1 de borrar
    // todos los datos relacionados al eliminar los usuarios.
    const deleteResult = await prisma.user.deleteMany({});
    
    console.log(`\n\u2705 \u00a1\u00c9xito! Se han eliminado ${deleteResult.count} usuarios y todos sus datos asociados.`);

  } catch (e) {
    console.error('\u274c Error durante el proceso de borrado:', e);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Conexi\u00f3n con la base de datos cerrada.');
  });
