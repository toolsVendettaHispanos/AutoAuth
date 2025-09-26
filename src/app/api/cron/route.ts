// src/app/api/cron/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { actualizarEstadoCompletoDelJuego } from '@/lib/actions/user.actions';
import type { UserWithProgress } from '@/lib/types';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', {
      status: 401,
    });
  }

  try {
    const users = await prisma.user.findMany({
        include: {
            propiedades: {
                include: {
                    habitaciones: { include: { configuracionHabitacion: { include: { requisitos: true } } } },
                    colaConstruccion: { orderBy: { createdAt: 'asc' } },
                    colaReclutamiento: { include: { tropaConfig: true } },
                    TropaUsuario: { include: { configuracionTropa: true } },
                    TropaSeguridadUsuario: { include: { configuracionTropa: true } }
                }
            },
            entrenamientos: { include: { configuracionEntrenamiento: true } },
            puntuacion: true,
            misiones: { orderBy: { fechaLlegada: 'asc' } },
            incomingAttacks: { orderBy: { arrivalTime: 'asc' } },
            colaEntrenamientos: { include: { entrenamiento: true, propiedad: { select: { nombre: true } } } },
            familyMember: { include: { family: { include: { members: { include: { user: { select: { lastSeen: true } } } } } } } }
        }
    });

    for (const user of users) {
        await actualizarEstadoCompletoDelJuego(user as unknown as UserWithProgress);
    }

    return NextResponse.json({ success: true, message: `Updated ${users.length} users.` });
  } catch (error) {
    console.error("Cron job failed:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
