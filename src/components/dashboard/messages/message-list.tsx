'use client';

import { Inbox, Trash2, Shield, User, Swords, Eye, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteMessage, markMessageAsRead } from "@/lib/actions/message.actions";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FullMessage, FullBattleReport, FullEspionageReport } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { folders } from "./message-folder-list"; // Import folders

type FeedItem = (FullMessage & { type: 'message' }) 
                | (FullBattleReport & { type: 'battle' }) 
                | (FullEspionageReport & { type: 'espionage' });

interface MessageListProps {
    items: FeedItem[];
    selectedItemId: string | null;
    onSelectItem: (item: FeedItem | null) => void;
    currentUserId: string;
    selectedCategory: string; // Add selectedCategory prop
}

export function MessageList({ items, selectedItemId, onSelectItem, currentUserId, selectedCategory }: MessageListProps) {
    const [isDeleting, startDeleteTransition] = useTransition();
    const { toast } = useToast();

    const handleSelectAndRead = (item: FeedItem) => {
        onSelectItem(item);
        if ('isRead' in item && !item.isRead) {
            markMessageAsRead(item.id);
        }
    }

    const handleDelete = (e: React.MouseEvent, messageId: string) => {
        e.stopPropagation(); 
        startDeleteTransition(async () => {
            const result = await deleteMessage(messageId);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Mensaje eliminado' });
                if (selectedItemId === messageId) {
                    onSelectItem(null); 
                }
            }
        });
    }

    const folderName = folders.find(f => f.category === selectedCategory)?.name || "Notificaciones";
    
    const renderItem = (item: FeedItem) => {
        const isSelected = selectedItemId === item.id;
        let isUnread = false;
        if ('isRead' in item) {
            isUnread = !item.isRead;
        }

        if (item.type === 'message') {
            return (
                <div 
                    key={item.id} 
                    className={cn(
                        "group p-3 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-4",
                        isSelected ? "bg-muted border-primary" : "border-transparent",
                        isUnread && "bg-primary/5 border-primary/70"
                    )}
                    onClick={() => handleSelectAndRead(item)}
                >
                    <Avatar className="h-9 w-9 mt-1">
                        {item.sender ? (
                            <AvatarImage src={item.sender.avatarUrl || ''} />
                        ) : (
                            <Shield className="h-full w-full p-2 text-muted-foreground"/>
                        )}
                        <AvatarFallback>{item.sender?.name?.[0] || 'S'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-baseline">
                             <p className={cn("font-semibold truncate", isUnread && "text-foreground")}>{item.sender?.name || "Sistema"}</p>
                              <p className="text-xs text-muted-foreground flex-shrink-0">
                                {new Date(item.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                              </p>
                        </div>
                        <p className={cn("font-medium truncate text-sm", isUnread ? "text-foreground" : "text-muted-foreground")}>{item.subject}</p>
                    </div>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => handleDelete(e, item.id)} 
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
        
        const isAttacker = 'attackerId' in item && item.attackerId === currentUserId;
        
        if (item.type === 'battle') {
             const wasVictory = (isAttacker && item.winner === 'attacker') || (!isAttacker && item.winner === 'defender');
             const opponent = isAttacker ? item.defender : item.attacker;
             return (
                 <div key={item.id} onClick={() => onSelectItem(item)} className={cn("group p-3 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-4", isSelected ? "bg-muted border-primary" : "border-transparent")}>
                     <div className="pt-1"><Swords className="h-6 w-6 text-destructive" /></div>
                     <div className="flex-grow overflow-hidden">
                         <p className="font-semibold truncate">{isAttacker ? "Ataque a " : "Defensa de "} {opponent.name}</p>
                         <div className="text-sm text-muted-foreground">
                             <Badge variant={wasVictory ? "default" : "destructive"} className={cn(wasVictory && "bg-green-600/80")}>
                                {wasVictory ? "Victoria" : "Derrota"}
                             </Badge>
                         </div>
                     </div>
                 </div>
             )
        }
        
         if (item.type === 'espionage') {
             const opponent = isAttacker ? item.defender : item.attacker;
             const wasSuccess = !!item.details.intel;
             return (
                 <div key={item.id} onClick={() => onSelectItem(item)} className={cn("group p-3 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-4", isSelected ? "bg-muted border-primary" : "border-transparent")}>
                     <div className="pt-1"><Eye className="h-6 w-6 text-blue-500" /></div>
                     <div className="flex-grow overflow-hidden">
                         <p className="font-semibold truncate">{isAttacker ? "Espionaje a " : "Espionaje de "} {opponent.name}</p>
                         <div className="text-sm text-muted-foreground">
                              <Badge variant={wasSuccess ? "default" : "destructive"} className={cn(wasSuccess && "bg-green-600/80")}>
                                {wasSuccess ? <CheckCircle className="h-3 w-3 mr-1"/> : <XCircle className="h-3 w-3 mr-1"/>}
                                {wasSuccess ? "Éxito" : "Fallo"}
                             </Badge>
                         </div>
                     </div>
                 </div>
             )
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{folderName}</h3>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-2 space-y-1">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                            <Inbox className="h-16 w-16" />
                            <p className="mt-4 text-lg">No hay notificaciones</p>
                        </div>
                    ) : (
                        items.map(renderItem)
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}