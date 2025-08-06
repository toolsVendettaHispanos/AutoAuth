


'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { DeleteConfigButton } from "./delete-config-button";
import { deleteTroopConfig } from "@/lib/actions/admin.actions";
import { FullConfiguracionEntrenamiento, FullConfiguracionTropa } from "@/lib/data";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

interface TroopConfigTableProps {
    initialData: FullConfiguracionTropa[];
    allTrainings: FullConfiguracionEntrenamiento[];
    tiposTropa: string[];
}

export function TroopConfigTable({ initialData, }: TroopConfigTableProps) {
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                     <CardTitle>Configuración de Tropas</CardTitle>
                    <CardDescription>
                        Define las estadísticas, costos y requisitos de todas las unidades del juego.
                    </CardDescription>
                </div>
                <Button asChild size="sm">
                    <Link href="/admin/panel/troops/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear Nueva Tropa
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="hidden sm:table-cell">Puntos</TableHead>
                                <TableHead className="text-right">Ataque</TableHead>
                                <TableHead className="text-right">Defensa</TableHead>
                                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.map(troop => (
                                <TableRow key={troop.id}>
                                    <TableCell className="font-medium">{troop.nombre}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{troop.puntos}</TableCell>
                                    <TableCell className="text-right">{troop.ataque.toLocaleString('de-DE')}</TableCell>
                                    <TableCell className="text-right">{troop.defensa.toLocaleString('de-DE')}</TableCell>
                                    <TableCell className="hidden md:table-cell">{troop.tipo}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/panel/troops/${troop.id}`}>Editar</Link>
                                        </Button>
                                        <DeleteConfigButton id={troop.id} action={deleteTroopConfig} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
