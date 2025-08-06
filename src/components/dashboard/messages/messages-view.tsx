
'use client';

import { useState, useMemo } from "react";
import { MessageList } from "./message-list";
import { MessageFolderList } from "./message-folder-list";
import { FullMessage, UserWithProgress } from "@/lib/data";
import { ComposeMessage } from "./compose-message";
import { MessageDetail } from "./message-detail";
import { cn } from "@/lib/utils";
import { FullBattleReport, FullEspionageReport } from "@/lib/types";

type FeedItem = (FullMessage & { type: 'message' }) 
                | (FullBattleReport & { type: 'battle' }) 
                | (FullEspionageReport & { type: 'espionage' });

interface MessagesViewProps {
    currentUser: UserWithProgress;
    initialFeed: FeedItem[];
    allUsers: { id: string; name: string }[];
}

export function MessagesView({ currentUser, initialFeed, allUsers }: MessagesViewProps) {
    const [selectedItem, setSelectedItem] = useState<FeedItem | null>(initialFeed[0] || null);
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const filteredFeed = useMemo(() => {
        if (selectedCategory === 'ALL') {
            return initialFeed;
        }
        return initialFeed.filter(item => {
            if (item.type === 'message') {
                return item.category === selectedCategory;
            }
            if (item.type === 'battle' && selectedCategory === 'BATALLA') return true;
            if (item.type === 'espionage' && selectedCategory === 'ESPIONAJE') return true;
             if (item.type === 'system' && selectedCategory === 'SISTEMA') return true;
            return false;
        });
    }, [initialFeed, selectedCategory]);
    
    const unreadCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: 0, JUGADOR: 0, BATALLA: 0, ESPIONAJE: 0, CONSTRUCCION: 0, SISTEMA: 0 };
        initialFeed.forEach(item => {
            if (item.type === 'message' && !item.isRead) {
                counts[item.category]++;
                counts['ALL']++;
            }
        });
        return counts;
    }, [initialFeed]);

    const handleSelectItem = (item: FeedItem) => {
        setSelectedItem(item);
    }
    
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Centro de Notificaciones</h2>
                    <p className="text-muted-foreground">
                        Comunícate y mantente al tanto de las novedades.
                    </p>
                </div>
                 <div className="flex items-center gap-2">
                    <ComposeMessage allUsers={allUsers} currentUser={currentUser} />
                </div>
            </div>
            
            <div className="border rounded-lg md:grid md:grid-cols-[250px_1fr] lg:grid-cols-[300px_minmax(0,1fr)_minmax(0,2fr)] h-[calc(100vh-280px)] overflow-hidden">
                <div className={cn("p-4 border-r", selectedItem && "hidden md:block")}>
                     <MessageFolderList 
                        selectedCategory={selectedCategory} 
                        onSelectCategory={setSelectedCategory}
                        unreadCounts={unreadCounts} 
                    />
                </div>

                <div className={cn("border-r", selectedItem && "hidden lg:block")}>
                     <MessageList 
                        items={filteredFeed}
                        selectedItemId={selectedItem?.id || null}
                        onSelectItem={handleSelectItem}
                        currentUserId={currentUser.id}
                    />
                </div>

                <div className={cn("lg:col-span-1", !selectedItem && "hidden lg:block")}>
                    {selectedItem ? (
                         <MessageDetail 
                            key={selectedItem.id}
                            item={selectedItem}
                            onBack={() => setSelectedItem(null)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center">
                            <p>Selecciona una notificación para leerla.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
