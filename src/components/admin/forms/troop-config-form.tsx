

'use client';

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveTroopConfig } from "@/lib/actions/admin.actions";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import type { ConfiguracionTropa } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FullConfiguracionEntrenamiento, FullConfiguracionTropa } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TroopConfigFormProps {
    troop: FullConfiguracionTropa | null;
    allTrainings: FullConfiguracionEntrenamiento[];
    allTroops: ConfiguracionTropa[];
    tiposTropa: string[];
}

function CheckboxList({ title, items, selectedItems, onSelectionChange }: { title: string, items: {id: string, nombre: string}[], selectedItems: Set<string>, onSelectionChange: (id: string, checked: boolean) => void}) {
    return (
        <div className="space-y-2">
            <Label>{title}</Label>
            <ScrollArea className="h-40 w-full rounded-md border p-4">
                 <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                            <Checkbox
                                id={`${title}-${item.id}`}
                                checked={selectedItems.has(item.id)}
                                onCheckedChange={(checked) => onSelectionChange(item.id, !!checked)}
                            />
                            <Label htmlFor={`${title}-${item.id}`} className="font-normal">
                                {item.nombre}
                            </Label>
                        </div>
                    ))}
                 </div>
            </ScrollArea>
        </div>
    )
}

export function TroopConfigForm({ troop, allTrainings, allTroops, tiposTropa }: TroopConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const [formData, setFormData] = useState({
        id: troop?.id || '',
        nombre: troop?.nombre || '',
        descripcion: troop?.descripcion || '',
        urlImagen: troop?.urlImagen || '',
        costoArmas: troop?.costoArmas || 0,
        costoMunicion: troop?.costoMunicion || 0,
        costoDolares: troop?.costoDolares || 0,
        ataque: troop?.ataque || 0,
        defensa: troop?.defensa || 0,
        puntos: troop?.puntos || 0,
        capacidad: troop?.capacidad || 0,
        velocidad: troop?.velocidad.toString() || '0',
        salario: troop?.salario || 0,
        duracion: troop?.duracion || 0,
        tipo: troop?.tipo || 'ATAQUE',
    });
    
    const [bonusContrincantes, setBonusContrincantes] = useState(troop?.bonusContrincante || []);

    const handleAddBonus = () => {
        setBonusContrincantes([...bonusContrincantes, { id: Date.now().toString(), tropaAtacanteId: troop?.id || '', tropaDefensoraId: '', factorPrioridad: 1.0 }]);
    };

    const handleRemoveBonus = (id: string) => {
        setBonusContrincantes(bonusContrincantes.filter(b => b.id !== id));
    };

    const handleBonusChange = (id: string, field: 'tropaDefensoraId' | 'factorPrioridad', value: string | number) => {
        setBonusContrincantes(bonusContrincantes.map(b => b.id === id ? { ...b, [field]: value } : b));
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({
            ...prev,
            [name]: isNumber ? (parseFloat(value) || 0) : value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    const [bonusAtaque, setBonusAtaque] = useState(new Set(troop?.bonusAtaque || []));
    const [bonusDefensa, setBonusDefensa] = useState(new Set(troop?.bonusDefensa || []));
    const [requisitos, setRequisitos] = useState(new Set(troop?.requisitos || []));

    const handleSelectionChange = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string, checked: boolean) => {
        setter(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        form.append('bonusAtaque', Array.from(bonusAtaque).join(','));
        form.append('bonusDefensa', Array.from(bonusDefensa).join(','));
        form.append('requisitos', Array.from(requisitos).join(','));
        form.append('bonusContrincantes', JSON.stringify(
            bonusContrincantes.map(({...rest}) => rest))
        );
        
        startTransition(async () => {
            const result = await saveTroopConfig(form);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Configuración guardada.' });
                router.push('/admin/panel/troops');
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <ScrollArea className="flex-grow p-1 pr-4">
                <div className="space-y-6">
                    <input type="hidden" name="id" value={troop?.id || ''} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="idForm">ID (Editable solo al crear)</Label>
                            <Input id="idForm" name="idForm" value={formData.id} onChange={handleInputChange} required disabled={!!troop} />
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="costoArmas">Armas</Label>
                            <Input id="costoArmas" name="costoArmas" type="number" value={formData.costoArmas || ''} onChange={handleInputChange} placeholder="0"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="costoMunicion">Munición</Label>
                            <Input id="costoMunicion" name="costoMunicion" type="number" value={formData.costoMunicion || ''} onChange={handleInputChange} placeholder="0"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="costoDolares">Dólares</Label>
                            <Input id="costoDolares" name="costoDolares" type="number" value={formData.costoDolares || ''} onChange={handleInputChange} placeholder="0"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ataque">Ataque</Label>
                            <Input id="ataque" name="ataque" type="number" value={formData.ataque || ''} onChange={handleInputChange} placeholder="0"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="defensa">Defensa</Label>
                            <Input id="defensa" name="defensa" type="number" value={formData.defensa || ''} onChange={handleInputChange} placeholder="0"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="puntos">Puntos</Label>
                            <Input id="puntos" name="puntos" type="number" step="0.01" value={formData.puntos || ''} onChange={handleInputChange} placeholder="0"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="capacidad">Capacidad</Label>
                            <Input id="capacidad" name="capacidad" type="number" value={formData.capacidad || ''} onChange={handleInputChange} placeholder="0"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="velocidad">Velocidad</Label>
                            <Input id="velocidad" name="velocidad" type="text" value={formData.velocidad} onChange={handleInputChange} placeholder="0"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salario">Salario</Label>
                            <Input id="salario" name="salario" type="number" value={formData.salario || ''} onChange={handleInputChange} placeholder="0"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duracion">Duración (s)</Label>
                            <Input id="duracion" name="duracion" type="number" value={formData.duracion || ''} onChange={handleInputChange} placeholder="0"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Tropa</Label>
                        <Select name="tipo" value={formData.tipo} onValueChange={(value) => handleSelectChange('tipo', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {tiposTropa.map(tipo => (
                                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <CheckboxList 
                            title="Bonus Ataque (Entrenamientos)"
                            items={allTrainings}
                            selectedItems={bonusAtaque}
                            onSelectionChange={(id, checked) => handleSelectionChange(setBonusAtaque, id, checked)}
                        />

                        <CheckboxList 
                            title="Bonus Defensa (Entrenamientos)"
                            items={allTrainings}
                            selectedItems={bonusDefensa}
                            onSelectionChange={(id, checked) => handleSelectionChange(setBonusDefensa, id, checked)}
                        />

                        <CheckboxList 
                            title="Requisitos de Entrenamiento"
                            items={allTrainings}
                            selectedItems={requisitos}
                            onSelectionChange={(id, checked) => handleSelectionChange(setRequisitos, id, checked)}
                        />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Bonificaciones de Ataque Específicas</CardTitle>
                            <CardDescription>
                                Define un multiplicador de daño contra tipos de tropa específicos. El valor por defecto es 1.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {bonusContrincantes.map((bonus) => (
                                <div key={bonus.id} className="flex items-center gap-2 p-2 border rounded-md">
                                    <Select 
                                        value={bonus.tropaDefensoraId} 
                                        onValueChange={(value) => handleBonusChange(bonus.id, 'tropaDefensoraId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona Tropa Defensora..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allTroops.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="2.9"
                                        value={bonus.factorPrioridad}
                                        onChange={(e) => handleBonusChange(bonus.id, 'factorPrioridad', parseFloat(e.target.value))}
                                        className="w-24"
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveBonus(bonus.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={handleAddBonus}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir Bonificación de Ataque
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-6 border-t mt-6 shrink-0">
                <Button type="button" variant="ghost" onClick={() => router.push('/admin/panel/troops')}>Cancelar</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                </Button>
            </div>
        </form>
    );
}
