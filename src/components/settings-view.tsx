
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserSettings } from '@/lib/actions/user.actions';
import type { UserWithProgress } from '@/lib/types';
import { Loader2, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface SettingsViewProps {
    user: UserWithProgress;
}

export function SettingsView({ user }: SettingsViewProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);

    const [name, setName] = useState(user.name);
    const [title, setTitle] = useState(user.title || '');
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const changesMade = name !== user.name || title !== (user.title || '') || avatarUrl !== (user.avatarUrl || '');
        setHasChanges(changesMade);
    }, [name, title, avatarUrl, user]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await updateUserSettings({
                name,
                title,
                avatarUrl
            });

            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error,
                });
            } else {
                toast({
                    title: '¡Éxito!',
                    description: result.success,
                });
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 2000);
            }
        });
    };

    return (
        <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ajustes de Perfil</h2>
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Tu Perfil</CardTitle>
                        <CardDescription>
                            Personaliza cómo te ven los demás en el mundo de Vendetta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                             <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre de Jugador</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: 'El Padrino', 'Capo'"
                                        disabled={isPending}
                                    />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="avatarUrl">URL del Avatar</Label>
                                <div className="flex items-start gap-4">
                                     <Input
                                        id="avatarUrl"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        placeholder="https://..."
                                        disabled={isPending}
                                        className="flex-grow"
                                    />
                                    <Avatar className="h-20 w-20 flex-shrink-0">
                                        <AvatarImage src={avatarUrl} alt={name} />
                                        <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isPending || !hasChanges || isSuccess} className="w-32">
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : isSuccess ? (
                                <Check className="mr-2 h-4 w-4" />
                            ) : null}
                            {isPending ? 'Guardando...' : (isSuccess ? 'Guardado' : 'Guardar')}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
