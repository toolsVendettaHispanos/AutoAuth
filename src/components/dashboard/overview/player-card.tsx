
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserWithProgress } from "@/lib/types";
import { Eye } from "lucide-react";
import Link from "next/link";

interface PlayerCardProps {
    user: UserWithProgress;
}

export function PlayerCard({ user }: PlayerCardProps) {
    return (
        <div className="group animate-fade-in-up relative">
            <Card className="hover:bg-muted/50 transition-colors h-full">
                 <Link href={`/profile/${user.id}`} className="flex items-center gap-4 h-full p-4">
                    <Avatar className="h-16 w-16 border-2 border-primary group-hover:border-accent transition-colors">
                        <AvatarImage src={user.avatarUrl || ''} alt={user.name} data-ai-hint="mafia boss" />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm text-muted-foreground">Jugador</p>
                        <p className="text-xl font-bold font-heading tracking-wider">{user.name}</p>
                    </div>
                </Link>
            </Card>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/vision/global" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye />
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver Visión Global</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
        </div>
    )
}
