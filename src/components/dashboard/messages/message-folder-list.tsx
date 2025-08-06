
'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Hammer, Inbox, Settings, Shield, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const folders = [
    { name: "Todas", category: "ALL", icon: <Inbox className="h-5 w-5" /> },
    { name: "Mensajes", category: "JUGADOR", icon: <Users className="h-5 w-5" /> },
    { name: "Batallas", category: "BATALLA", icon: <Shield className="h-5 w-5" /> },
    { name: "Espionaje", category: "ESPIONAJE", icon: <Eye className="h-5 w-5" /> },
    { name: "Sistema", category: "SISTEMA", icon: <Settings className="h-5 w-5" /> },
];

interface MessageFolderListProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    unreadCounts: Record<string, number>;
}

export function MessageFolderList({ selectedCategory, onSelectCategory, unreadCounts }: MessageFolderListProps) {

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold px-2">Carpetas</h3>
            <div className="flex flex-col gap-1">
                {folders.map(folder => {
                    const count = unreadCounts[folder.category] || 0;
                    return (
                        <Button
                            key={folder.category}
                            variant={selectedCategory === folder.category ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3 px-4 py-6 text-base"
                            onClick={() => onSelectCategory(folder.category)}
                        >
                            {folder.icon}
                            <span className="flex-grow">{folder.name}</span>
                            {count > 0 && <Badge variant="destructive">{count}</Badge>}
                        </Button>
                    )
                })}
            </div>
        </div>
    );
}
