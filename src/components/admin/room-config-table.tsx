

'use client';
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { RoomConfigForm } from "./forms/room-config-form";
import { deleteRoomConfig } from "@/lib/actions/admin.actions";
import { DeleteConfigButton } from "./delete-config-button";
import { ConfiguracionHabitacion } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

interface RoomConfigTableProps {
    initialData: (ConfiguracionHabitacion & { requisitos: { requiredRoomId: string; requiredLevel: number }[] })[];
}

function formatRequirements(requisitos: RoomConfigTableProps['initialData'][0]['requisitos'], allRooms: RoomConfigTableProps['initialData']) {
    if (!requisitos || requisitos.length === 0) return '-';
    const allRoomsMap = new Map(allRooms.map(r => [r.id, r.nombre]));
    return requisitos.map(req => `${allRoomsMap.get(req.requiredRoomId) || req.requiredRoomId} (Nvl ${req.requiredLevel})`).join(', ');
}


export function RoomConfigTable({ initialData }: RoomConfigTableProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<(ConfiguracionHabitacion & { requisitos: { requiredRoomId: string; requiredLevel: number }[] }) | null>(null);

    const handleEdit = (room: ConfiguracionHabitacion & { requisitos: { requiredRoomId: string; requiredLevel: number }[] }) => {
        setSelectedRoom(room);
        setIsOpen(true);
    };

    const handleCreate = () => {
        setSelectedRoom(null);
        setIsOpen(true);
    }
    
    return (
        <>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                     <CardTitle>Configuración de Habitaciones</CardTitle>
                </div>
                <Button onClick={handleCreate} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nueva Habitacion
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[70vh] w-full rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky top-0 bg-muted z-10">ID</TableHead>
                                <TableHead className="sticky top-0 bg-muted z-10">Nombre</TableHead>
                                <TableHead className="sticky top-0 bg-muted z-10 hidden sm:table-cell">Requisitos</TableHead>
                                <TableHead className="sticky top-0 bg-muted z-10 text-right">Puntos</TableHead>
                                <TableHead className="sticky top-0 bg-muted z-10 text-right">Armas</TableHead>
                                <TableHead className="sticky top-0 bg-muted z-10 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.map(room => (
                                <TableRow key={room.id} className="even:bg-muted/50">
                                    <TableCell className="font-mono text-xs">{room.id}</TableCell>
                                    <TableCell className="font-medium">{room.nombre}</TableCell>
                                    <TableCell className="text-xs hidden sm:table-cell">{formatRequirements(room.requisitos, initialData)}</TableCell>
                                    <TableCell className="text-right">{room.puntos}</TableCell>
                                    <TableCell className="text-right">{room.costoArmas.toLocaleString('de-DE')}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>Editar</Button>
                                        <DeleteConfigButton id={room.id} action={deleteRoomConfig} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedRoom ? 'Editar' : 'Crear'} Habitación</DialogTitle>
                    </DialogHeader>
                    <RoomConfigForm 
                        room={selectedRoom} 
                        allRooms={initialData}
                        onFinished={() => setIsOpen(false)} 
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
