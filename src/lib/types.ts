import { User, Propiedad } from '@prisma/client';

export type UserWithProgress = User & {
    propiedades: Propiedad[];
};
