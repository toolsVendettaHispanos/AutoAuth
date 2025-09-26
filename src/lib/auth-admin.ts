
'use server';

import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from './constants';
import { redirect } from 'next/navigation';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'default_admin_password';

export async function loginAdmin(password: string) {
    if (password === ADMIN_PASSWORD) {
        cookies().set(ADMIN_COOKIE_NAME, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });
        return { success: true };
    }
    return { success: false, error: 'Contraseña incorrecta.' };
}

export async function logoutAdmin() {
    cookies().delete(ADMIN_COOKIE_NAME);
    redirect('/admin');
}

export async function verifyAdminSession(): Promise<boolean> {
    const cookie = cookies().get(ADMIN_COOKIE_NAME);
    return cookie?.value === 'true';
}
