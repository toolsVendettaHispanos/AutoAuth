
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Lock, Unlock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface Requirement {
    id: string;
    name: string;
    requiredLevel: number;
    userLevel: number;
}

export type TechStatus = 'unlocked' | 'locked' | 'available';

interface TechItemCardProps {
    name: string;
    description: string | null;
    imageUrl: string | null;
    requirements: Requirement[];
    status: TechStatus;
}

export function TechItemCard({ name, description, imageUrl, requirements, status }: TechItemCardProps) {
    const hasRequirements = requirements.length > 0;

    return (
        <Card className={cn(
            "tech-card flex flex-col h-full",
            status === 'locked' && "grayscale opacity-60",
            status === 'available' && "border-primary/50 shadow-lg shadow-primary/10",
        )}>
            <CardHeader className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-24 h-20 sm:w-20 sm:h-16 relative rounded-md overflow-hidden border flex-shrink-0 group">
                    <Image
                        src={imageUrl || "https://placehold.co/80x56.png"}
                        alt={name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint="game item icon"
                    />
                </div>
                <div>
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col pt-0">
                <Separator />
                <div className="pt-4 flex-grow">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        {status === 'unlocked' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-destructive" />}
                        {status === 'unlocked' ? "Desbloqueado" : "Requisitos para Desbloquear"}
                    </h4>
                    {hasRequirements ? (
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                            {requirements.map(req => {
                                const requirementMet = req.userLevel >= req.requiredLevel;
                                return (
                                     <Badge key={req.id} variant={requirementMet ? "default" : "secondary"} className="mr-1 mb-1 bg-opacity-50">
                                        {req.name} (Nivel {req.userLevel}/{req.requiredLevel})
                                    </Badge>
                                )
                            })}
                        </div>
                    ) : (
                         <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Unlock className="h-4 w-4 text-green-500"/>
                            Disponible desde el inicio.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
