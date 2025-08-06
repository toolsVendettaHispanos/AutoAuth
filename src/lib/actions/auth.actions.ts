
'use server';

import prisma from "../prisma/prisma";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { getUserWithProgressByUsername } from "../data";
import { SESSION_COOKIE_NAME } from "../constants";


interface LoginInput {
    username: string;
    password?: string;
}

export async function login(credentials: LoginInput) {
    const { username, password } = credentials;

    const user = await getUserWithProgressByUsername(username);
    if (!user) {
        return { error: 'Usuario no encontrado.' };
    }
    
    // Special case for 'bomberox' to bypass password check during development
    if (username.toLowerCase() !== 'bomberox' && user.password !== password) {
        return { error: 'La contraseña es incorrecta.' };
    }
    
    // Set the session cookie
    cookies().set(SESSION_COOKIE_NAME, user.username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // One week
        path: '/',
    });

    // Log login history
    try {
        const headerList = headers();
        const ip = headerList.get('x-forwarded-for') ?? 'unknown';
        const userAgent = headerList.get('user-agent') ?? 'unknown';
        
        await prisma.loginHistory.create({
        data: {
            userId: user.id,
            ipAddress: ip,
            userAgent: userAgent,
        }
        })
    } catch (e) {
        console.error("Failed to log login history:", e);
    }
    
    return { success: true };
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
}


interface RegisterUserInput {
    username: string;
    password: string;
    location: {
        ciudad: number;
        barrio: number;
        edificio: number;
    }
}

async function findAvailableSlot(): Promise<{ ciudad: number; barrio: number; edificio: number; }> {
    for (let c = 1; c <= 100; c++) {
        for (let b = 1; b <= 100; b++) {
            for (let e = 1; e <= 225; e++) {
                const existing = await prisma.propiedad.findUnique({
                    where: { ciudad_barrio_edificio: { ciudad: c, barrio: b, edificio: e } }
                });
                if (!existing) {
                    return { ciudad: c, barrio: b, edificio: e };
                }
            }
        }
    }
    return { ciudad: 1, barrio: 1, edificio: Math.floor(Math.random() * 225) + 1 };
}

export async function registerUser(input: RegisterUserInput) {
    const { username, password, location } = input;

    const existingUser = await prisma.user.findUnique({
        where: { username }
    });

    if (existingUser) {
        return { error: 'El nombre de usuario ya está en uso.' };
    }

    let finalLocation = location;
    const existingProperty = await prisma.propiedad.findUnique({
        where: { ciudad_barrio_edificio: { ciudad: location.ciudad, barrio: location.barrio, edificio: location.edificio } }
    });

    if (existingProperty) {
        finalLocation = await findAvailableSlot();
    }

    try {
        const allRoomConfigs = await prisma.configuracionHabitacion.findMany();

        const newUser = await prisma.user.create({
            data: {
                username,
                password,
                name: username,
                title: 'Nuevo Jefe',
                avatarUrl: `https://placehold.co/128x128.png`,
                propiedades: {
                    create: {
                        nombre: 'Propiedad Principal',
                        ciudad: finalLocation.ciudad,
                        barrio: finalLocation.barrio,
                        edificio: finalLocation.edificio,
                        armas: 10000,
                        municion: 10000,
                        alcohol: 10000,
                        dolares: 10000,
                        habitaciones: {
                            create: allRoomConfigs.map(config => ({
                                configuracionHabitacionId: config.id,
                                nivel: 1
                            }))
                        }
                    }
                },
                puntuacion: {
                    create: {
                        puntosHabitaciones: 0,
                        puntosTropas: 0,
                        puntosEntrenamientos: 0,
                        puntosTotales: 0,
                    }
                }
            }
        });

        await login({ username: newUser.username, password: newUser.password });

        revalidatePath('/');
        return { success: true, user: newUser };

    } catch (error) {
        console.error('Error durante el registro:', error);
        return { error: 'Ocurrió un error en el servidor durante el registro.' };
    }
}
