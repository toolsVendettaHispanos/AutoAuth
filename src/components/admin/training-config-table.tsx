


'use client';
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { TrainingConfigForm } from "./forms/training-config-form";
import { deleteTrainingConfig } from "@/lib/actions/admin.actions";
import { DeleteConfigButton } from "./delete-config-button";
import { FullConfiguracionEntrenamiento } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface TrainingConfigTableProps {
    initialData: FullConfiguracionEntrenamiento[];
}

function formatRequirements(requisitos: FullConfiguracionEntrenamiento['requisitos'], allTrainings: FullConfiguracionEntrenamiento[]) {
    if (!requisitos || requisitos.length === 0) return '-';
    const allTrainingsMap = new Map(allTrainings.map(t => [t.id, t.nombre]));
    return requisitos.map(req => `${allTrainingsMap.get(req.requiredTrainingId) || req.requiredTrainingId} (Nvl ${req.requiredLevel})`).join(', ');
}


export function TrainingConfigTable({ initialData }: TrainingConfigTableProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FullConfiguracionEntrenamiento | null>(null);

    const handleEdit = (item: FullConfiguracionEntrenamiento) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setIsOpen(true);
    }
    
    return (
        <>
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                     <CardTitle>Configuración de Entrenamientos</CardTitle>
                </div>
                <Button onClick={handleCreate} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nuevo Entrenamiento
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
                                <TableHead className="sticky top-0 bg-muted z-10 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.map(training => (
                                <TableRow key={training.id} className="even:bg-muted/50">
                                    <TableCell className="font-mono text-xs">{training.id}</TableCell>
                                    <TableCell className="font-medium">{training.nombre}</TableCell>
                                    <TableCell className="text-xs hidden sm:table-cell">{formatRequirements(training.requisitos, initialData)}</TableCell>
                                    <TableCell className="text-right">{training.puntos}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(training)}>Editar</Button>
                                        <DeleteConfigButton id={training.id} action={deleteTrainingConfig} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
             </CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Editar' : 'Crear'} Entrenamiento</DialogTitle>
                    </DialogHeader>
                    <TrainingConfigForm 
                        training={selectedItem} 
                        allTrainings={initialData}
                        onFinished={() => setIsOpen(false)} 
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
