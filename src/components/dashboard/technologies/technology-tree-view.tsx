
'use client';
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FullConfiguracionHabitacion, FullConfiguracionTropa, FullConfiguracionEntrenamiento, UserWithProgress } from "@/lib/types";
import { TechItemCard, TechStatus } from "./tech-item-card";

interface TechnologyTreeViewProps {
    user: UserWithProgress;
    rooms: FullConfiguracionHabitacion[];
    trainings: FullConfiguracionEntrenamiento[];
    troops: FullConfiguracionTropa[];
}

type Category = 'rooms' | 'trainings' | 'troops';

export function TechnologyTreeView({ user, rooms, trainings, troops }: TechnologyTreeViewProps) {
    const [activeCategory, setActiveCategory] = useState<Category>('rooms');
    
    const userRoomsMap = useMemo(() => new Map(user.propiedades.flatMap(p => p.habitaciones).map(h => [h.configuracionHabitacionId, h.nivel])), [user.propiedades]);
    const userTrainingsMap = useMemo(() => new Map(user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel])), [user.entrenamientos]);
    
    const roomMap = useMemo(() => new Map(rooms.map(r => [r.id, r.nombre])), [rooms]);
    const trainingMap = useMemo(() => new Map(trainings.map(t => [t.id, t.nombre])), [trainings]);

    const getStatus = (requirements: { requiredId: string; requiredLevel: number; type: 'room' | 'training' }[]): TechStatus => {
        let allMet = true;
        for (const req of requirements) {
            const userLevel = req.type === 'room' 
                ? (userRoomsMap.get(req.requiredId) || 0)
                : (userTrainingsMap.get(req.requiredId) || 0);
            
            if (userLevel < req.requiredLevel) {
                allMet = false;
                break;
            }
        }
        return allMet ? 'unlocked' : 'locked';
    };

    const getTroopStatus = (requirements: string[]): TechStatus => {
        const isUnlocked = requirements.every(reqId => (userTrainingsMap.get(reqId) || 0) >= 1);
        return isUnlocked ? 'unlocked' : 'locked';
    };

    const processRequirements = (reqs: {requiredRoomId?: string, requiredLevel?: number, requiredTrainingId?: string}[], type: 'room' | 'training' | 'troop') => {
        return reqs.map(req => {
            let reqId, reqLevel, nameMap, userLevelMap;
            
            if(type === 'room') {
                reqId = req.requiredRoomId;
                reqLevel = req.requiredLevel;
                nameMap = roomMap;
                userLevelMap = userRoomsMap;
            } else if (type === 'training') {
                reqId = req.requiredTrainingId;
                reqLevel = req.requiredLevel;
                nameMap = trainingMap;
                userLevelMap = userTrainingsMap;
            } else { // troop
                reqId = req;
                reqLevel = 1; // Troops just need the training unlocked
                nameMap = trainingMap;
                userLevelMap = userTrainingsMap;
            }

            return {
                id: reqId,
                name: nameMap.get(reqId) || reqId,
                requiredLevel: reqLevel,
                userLevel: userLevelMap.get(reqId) || 0,
            }
        });
    }

    const renderItems = (items: (FullConfiguracionHabitacion | FullConfiguracionTropa | FullConfiguracionEntrenamiento)[], type: Category) => {
        return items.map((item, index) => {
            const requirements = type === 'rooms' ? processRequirements((item as FullConfiguracionHabitacion).requisitos, 'room')
                               : type === 'trainings' ? processRequirements((item as FullConfiguracionEntrenamiento).requisitos, 'training')
                               : processRequirements((item as FullConfiguracionTropa).requisitos || [], 'troop');
            
            const status = type === 'rooms' ? getStatus(requirements.map(r => ({ requiredId: r.id, requiredLevel: r.requiredLevel, type: 'room' })))
                         : type === 'trainings' ? getStatus(requirements.map(r => ({ requiredId: r.id, requiredLevel: r.requiredLevel, type: 'training' })))
                         : getTroopStatus((item as FullConfiguracionTropa).requisitos || []);

            const isAvailable = status === 'locked' && requirements.every(r => (userTrainingsMap.get(r.id) || 0) >= r.requiredLevel);
            const finalStatus = status === 'unlocked' ? 'unlocked' : (isAvailable ? 'available' : 'locked');
            
            return (
                 <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                     <TechItemCard
                        name={item.nombre}
                        description={item.descripcion}
                        imageUrl={item.urlImagen}
                        status={finalStatus}
                        requirements={requirements}
                    />
                </div>
            )
        })
    }
    
    return (
        <div className="w-full mt-4">
            <div className="flex gap-2 mb-4">
                 <Button variant={activeCategory === 'rooms' ? 'default' : 'outline'} onClick={() => setActiveCategory('rooms')}>Habitaciones</Button>
                 <Button variant={activeCategory === 'trainings' ? 'default' : 'outline'} onClick={() => setActiveCategory('trainings')}>Entrenamientos</Button>
                 <Button variant={activeCategory === 'troops' ? 'default' : 'outline'} onClick={() => setActiveCategory('troops')}>Tropas</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeCategory === 'rooms' && renderItems(rooms, 'rooms')}
                {activeCategory === 'trainings' && renderItems(trainings, 'trainings')}
                {activeCategory === 'troops' && renderItems(troops, 'troops')}
            </div>
        </div>
    );
}
