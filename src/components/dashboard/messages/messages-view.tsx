'use client';

import { useState, useMemo } from "react";
import { MessageList } from "./message-list";
import { MessageFolderList } from "./message-folder-list";
import { FullMessage, UserWithProgress } from "@/lib/data";
import { ComposeMessage } from "./compose-message";
import { MessageDetail } from "./message-detail";
import { cn } from "@/lib/utils";
import { FullBattleReport, FullEspionageReport } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

type FeedItem = (FullMessage & { type: 'message' }) 
                | (FullBattleReport & { type: 'battle' }) 
                | (FullEspionageReport & { type: 'espionage' });

interface MessagesViewProps {
    currentUser: UserWithProgress;
    initialFeed: FeedItem[];
    allUsers: { id: string; name: string }[];
}

export function MessagesView({ currentUser, initialFeed, allUsers }: MessagesViewProps) {
    const [selectedItem, setSelectedItem] = useState<FeedItem | null>(initialFeed.length > 0 ? initialFeed[0] : null);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const isMobile = useIsMobile();
    
    const showDetailColumn = selectedItem !== null;

    const filteredFeed = useMemo(() => {
        const sortedFeed = [...initialFeed].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (selectedCategory === 'ALL') {
            return sortedFeed;
        }
        return sortedFeed.filter(item => {
            if (item.type === 'message') {
                return item.category === selectedCategory;
            }
            if (item.type === 'battle' && selectedCategory === 'BATALLA') return true;
            if (item.type === 'espionage' && selectedCategory === 'ESPIONAJE') return true;
            if (item.type === 'message' && item.category === 'SISTEMA' && selectedCategory === 'SISTEMA') return true;
            return false;
        });
    }, [initialFeed, selectedCategory]);
    
    const unreadCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: 0, JUGADOR: 0, BATALLA: 0, ESPIONAJE: 0, SISTEMA: 0 };
        initialFeed.forEach(item => {
            if (item.type === 'message' && !item.isRead) {
                counts[item.category]++;
                counts['ALL']++;
            }
        });
        return counts;
    }, [initialFeed]);

    const handleSelectItem = (item: FeedItem | null) => {
        setSelectedItem(item);
    }

    const folderListComponent = (
        <MessageFolderList 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory}
            unreadCounts={unreadCounts} 
        />
    );

    const messageListComponent = (
        <MessageList 
            items={filteredFeed}
            selectedItemId={selectedItem?.id || null}
            onSelectItem={handleSelectItem}
            currentUserId={currentUser.id}
            selectedCategory={selectedCategory}
        />
    );

    const detailComponent = (
        <MessageDetail 
            key={selectedItem?.id}
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
        />
    );
    
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
            
            <div className="border rounded-lg grid h-[calc(100vh-280px)] overflow-hidden 
                md:grid-cols-[250px_1fr] 
                lg:grid-cols-[300px_minmax(0,1fr)_minmax(0,2fr)]">
                
                {/* --- Vista Móvil --- */}
                {isMobile && (
                    <div className="contents">
                        {showDetailColumn ? (
                            <div className="col-span-full">{detailComponent}</div>
                        ) : (
                            <div className="col-span-full flex flex-col overflow-y-auto">
                                <div className="p-4 border-b">{folderListComponent}</div>
                                <div className="flex-grow">{messageListComponent}</div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* --- Vista Tablet --- */}
                {!isMobile && (
                    <div className="contents lg:hidden">
                        <div className="p-4 border-r">{folderListComponent}</div>
                        <div className="col-span-1">{showDetailColumn ? detailComponent : messageListComponent}</div>
                    </div>
                )}

                {/* --- Vista Escritorio --- */}
                <div className="hidden lg:contents">
                     <div className="p-4 border-r">
                        {folderListComponent}
                    </div>
                    <div className="border-r">
                        {messageListComponent}
                    </div>
                    <div className="lg:col-span-1">
                        {detailComponent}
                    </div>
                </div>
            </div>
        </div>
    );
}