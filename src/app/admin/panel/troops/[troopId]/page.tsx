
import { verifyAdminSession } from "@/lib/auth-admin";
import { getTrainingConfigurations, getTroopConfigurations } from "@/lib/data";
import { redirect } from "next/navigation";
import { TroopConfigForm } from "@/components/admin/forms/troop-config-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TipoTropa } from "@prisma/client";
import type { FullConfiguracionTropa } from "@/lib/types";

export default async function EditTroopPage({ params }: { params: { troopId: string } }) {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        redirect('/admin');
    }

    const { troopId } = params;
    const isNew = troopId === 'new';

    const [allTroops, allTrainings] = await Promise.all([
        getTroopConfigurations(),
        getTrainingConfigurations()
    ]);

    const troop = isNew ? null : allTroops.find(t => t.id === troopId) as FullConfiguracionTropa | null;

    if (!isNew && !troop) {
        return (
            <div className="space-y-4">
                 <Button asChild variant="outline" size="sm">
                    <Link href="/admin/panel/troops">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>No se encontró la tropa con el ID especificado.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
     const tiposTropa = Object.values(TipoTropa);


    return (
        <div className="space-y-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/panel/troops">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a la tabla de Tropas
                </Link>
            </Button>
            <Card>
                 <CardHeader>
                    <CardTitle>{isNew ? "Crear Nueva Tropa" : `Editando: ${troop?.nombre}`}</CardTitle>
                    <CardDescription>
                       Ajusta todos los parámetros de la unidad.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TroopConfigForm
                        troop={troop}
                        allTroops={allTroops}
                        allTrainings={allTrainings}
                        tiposTropa={tiposTropa}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
