
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UserWithProgress } from "@/lib/types";
import { Crown, Shield, User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FamilyRole } from "@prisma/client";

interface PlayerCardProps {
    user: UserWithProgress;
}

const roleIcons: Record<FamilyRole, React.ReactNode> = {
    [FamilyRole.LEADER]: <Crown className="h-4 w-4 text-amber-400" />,
    [FamilyRole.CO_LEADER]: <Shield className="h-4 w-4 text-blue-400" />,
    [FamilyRole.MEMBER]: <UserIcon className="h-4 w-4 text-muted-foreground" />,
}

export function PlayerCard({ user }: PlayerCardProps) {
    // Simulating progress towards the next level/rank
    const progress = ( (user.puntuacion?.puntosTotales || 0) % 1000) / 10;

    return (
         <Card className="group relative overflow-hidden h-full flex items-center p-4 transition-all duration-300">
            <div className="absolute inset-0 bg-black/50 z-0">
                 <Image 
                    src="/nuevas/edificionuevo.jpg" 
                    alt="Player background"
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 opacity-30"
                    data-ai-hint="dark office interior"
                />
            </div>
            <div className="relative z-10 flex items-center gap-4 w-full">
                <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-lg shrink-0">
                    <AvatarImage src={user.avatarUrl || ''} alt={user.name} data-ai-hint="mafia boss" />
                    <AvatarFallback className="text-4xl">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                 <div className="flex flex-col justify-center flex-grow">
                     <CardTitle className="text-2xl font-bold tracking-wider text-white [text-shadow:0_2px_4px_rgb(0_0_0_/_0.8)]">{user.name}</CardTitle>
                    <p className="text-md text-white/80 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.8)] mb-2">{user.title || 'Nuevo Jefe'}</p>
                     {user.familyMember && (
                         <Link href={`/family/members?id=${user.familyMember.family.id}`} className="hover:underline flex items-center gap-2 text-sm text-primary-foreground/80">
                             <Avatar className="h-6 w-6 border">
                                <AvatarImage src={user.familyMember.family.avatarUrl || ''} />
                                <AvatarFallback className="text-xs">{user.familyMember.family.tag.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">[{user.familyMember.family.tag}]</span>
                        </Link>
                    )}
                 </div>
            </div>
        </Card>
    )
}
