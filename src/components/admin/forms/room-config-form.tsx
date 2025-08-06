
'use client';

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveRoomConfig } from "@/lib/actions/admin.actions";
import { Loader2 } from "lucide-react";
import type { ConfiguracionHabitacion } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoomConfigFormProps {
    room: (ConfiguracionHabitacion & { requisitos: { requiredRoomId: string; requiredLevel: number }[] }) | null;
    allRooms: ConfiguracionHabitacion[];
    onFinished: () => void;
}

export function RoomConfigForm({ room, allRooms, onFinished }: RoomConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Use state to manage form fields for controlled components
    const [formData, setFormData] = useState({
        id: room?.id || '',
        nombre: room?.nombre || '',
        descripcion: room?.descripcion || '',
        urlImagen: room?.urlImagen || '',
        costoArmas: room?.costoArmas || 0,
        costoMunicion: room?.costoMunicion || 0,
        costoDolares: room?.costoDolares || 0,
        duracion: room?.duracion || 0,
        puntos: room?.puntos || 0,
        produccionBase: room?.produccionBase || 0,
        produccionRecurso: room?.produccionRecurso || '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({
            ...prev,
            [name]: isNumber ? (parseInt(value, 10) || 0) : value
        }));
    };
    
    const initialRequirements = new Map(
        (room?.requisitos || []).map(req => [req.requiredRoomId, req.requiredLevel])
    );
    const [requirements, setRequirements] = useState<Map<string, number>>(initialRequirements);

    const handleRequirementChange = (roomId: string, checked: boolean) => {
        const newRequirements = new Map(requirements);
        if (checked) {
            newRequirements.set(roomId, 1);
        } else {
            newRequirements.delete(roomId);
        }
        setRequirements(newRequirements);
    };

    const handleLevelChange = (roomId: string, level: number) => {
        const newRequirements = new Map(requirements);
        if (level > 0) {
            newRequirements.set(roomId, level);
        } else {
            newRequirements.delete(roomId);
        }
        setRequirements(newRequirements);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        
        requirements.forEach((level, id) => {
            form.append('requirement_ids', id);
            form.append(`requirement_level_${id}`, level.toString());
        });
        
        startTransition(async () => {
            const result = await saveRoomConfig(form);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Configuración guardada.' });
                onFinished();
            }
        });
    }
    
    const availableRequirements = allRooms.filter(r => r.id !== room?.id);

    return (
        <form onSubmit={handleSubmit}>
            <ScrollArea className="max-h-[70vh] p-1 pr-6">
                <div className="space-y-4">
                    <input type="hidden" name="originalId" value={room?.id || ''} />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="id">ID</Label>
                            <Input id="id" name="id" value={formData.id} onChange={handleInputChange} required disabled={!!room} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="urlImagen">URL de Imagen</Label>
                        <Input id="urlImagen" name="urlImagen" value={formData.urlImagen} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="costoArmas">Armas</Label>
                            <Input id="costoArmas" name="costoArmas" type="number" value={formData.costoArmas || ''} onChange={handleInputChange} placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="costoMunicion">Munición</Label>
                            <Input id="costoMunicion" name="costoMunicion" type="number" value={formData.costoMunicion || ''} onChange={handleInputChange} placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="costoDolares">Dólares</Label>
                            <Input id="costoDolares" name="costoDolares" type="number" value={formData.costoDolares || ''} onChange={handleInputChange} placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duracion">Duración (s)</Label>
                            <Input id="duracion" name="duracion" type="number" value={formData.duracion || ''} onChange={handleInputChange} placeholder="0" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="puntos">Puntos</Label>
                            <Input id="puntos" name="puntos" type="number" step="0.01" value={formData.puntos || ''} onChange={handleInputChange} placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="produccionBase">Producción Base</Label>
                            <Input id="produccionBase" name="produccionBase" type="number" value={formData.produccionBase || ''} onChange={handleInputChange} placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="produccionRecurso">Recurso Producido</Label>
                            <Input id="produccionRecurso" name="produccionRecurso" value={formData.produccionRecurso || ''} onChange={handleInputChange} placeholder="armas, municion..." />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Requisitos</Label>
                        <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                            {availableRequirements.map(reqRoom => {
                                const isChecked = requirements.has(reqRoom.id);
                                return (
                                    <div key={reqRoom.id} className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <Checkbox
                                                id={`req-${reqRoom.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => handleRequirementChange(reqRoom.id, !!checked)}
                                            />
                                            <Label htmlFor={`req-${reqRoom.id}`} className="font-normal">
                                                {reqRoom.nombre}
                                            </Label>
                                        </div>
                                        {isChecked && (
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`level-${reqRoom.id}`} className="text-xs">Nivel:</Label>
                                                <Input
                                                    id={`level-${reqRoom.id}`}
                                                    type="number"
                                                    value={requirements.get(reqRoom.id) || ''}
                                                    onChange={(e) => handleLevelChange(reqRoom.id, parseInt(e.target.value, 10))}
                                                    className="h-8 w-20"
                                                    min="1"
                                                    placeholder="1"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                </Button>
            </div>
        </form>
    );
}
