
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { UserWithProgress } from "@/lib/types";
import { Eye, Crown, Shield, User as UserIcon } from "lucide-react";
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
    return (
        <Card className="group animate-fade-in-up relative overflow-hidden h-full">
            <Image 
                src="/img/nuevas/edificionuevo.jpg" 
                alt="Player background"
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                data-ai-hint="dark office interior"
            />
             <div className="absolute inset-0 bg-black/70" />
            <CardContent className="relative flex flex-col items-center justify-center h-full p-4 text-center text-white">
                <Avatar className="h-28 w-28 border-4 border-white/10 shadow-lg mb-4">
                    <AvatarImage src={user.avatarUrl || ''} alt={user.name} data-ai-hint="mafia boss" />
                    <AvatarFallback className="text-4xl">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                 <CardTitle className="text-2xl font-bold tracking-wider [text-shadow:0_2px_4px_rgb(0_0_0_/_0.8)]">{user.name}</CardTitle>
                <p className="text-sm text-white/80 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.8)]">{user.title || 'Nuevo Jefe'}</p>

                <div className="mt-4">
                    {user.familyMember ? (
                        <div className="flex flex-col items-center gap-2">
                             <Link href={`/family/members?id=${user.familyMember.family.id}`} className="hover:underline flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.familyMember.family.avatarUrl || ''} />
                                    <AvatarFallback>{user.familyMember.family.tag.charAt(0)}</AvatarFallback>
                                </Avatar>
                                 <span className="font-semibold text-lg">[{user.familyMember.family.tag}] {user.familyMember.family.name}</span>
                            </Link>
                             <div className="flex items-center gap-1 text-xs bg-black/30 px-2 py-1 rounded-full">
                                {roleIcons[user.familyMember.role]}
                                <span>{user.familyMember.role}</span>
                            </div>
                        </div>
                    ) : (
                        <Button asChild variant="secondary" className="mt-2">
                            <Link href="/family/find">Buscar Familia</Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
