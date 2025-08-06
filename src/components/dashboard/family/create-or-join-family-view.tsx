
'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFamily } from "@/lib/actions/family.actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { Loader2, Search, Users } from "lucide-react";
import Link from "next/link";

export function CreateOrJoinFamilyView() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleCreateFamily = async (formData: FormData) => {
        startTransition(async () => {
            const result = await createFamily(formData);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: '¡Éxito!', description: result.success });
            }
        });
    };

    return (
        <div className="main-view">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Únete a la Familia</h2>
                    <p className="text-muted-foreground">
                        Crea tu propio clan o únete a uno existente para dominar la ciudad.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 <Card>
                    <form action={handleCreateFamily}>
                        <CardHeader>
                            <CardTitle>Funda tu Propia Familia</CardTitle>
                            <CardDescription>Define el nombre, el tag y los símbolos de tu nuevo imperio.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="name">Nombre de la Familia</Label>
                                    <Input id="name" name="name" placeholder="Los Corleone" required disabled={isPending} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tag">Tag (3-4 letras)</Label>
                                    <Input id="tag" name="tag" placeholder="CRL" required minLength={3} maxLength={4} disabled={isPending} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción Pública</Label>
                                <Textarea id="description" name="description" placeholder="Una oferta que no podrán rechazar..." disabled={isPending} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avatarUrl">URL del Emblema</Label>
                                <Input id="avatarUrl" name="avatarUrl" placeholder="https://..." disabled={isPending} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Fundar Familia
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                 <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border rounded-lg h-full">
                    <Users className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-xl font-bold">¿Prefieres Unirte a un Clan?</h3>
                    <p className="text-muted-foreground">
                        Busca entre las familias existentes, conoce a sus miembros y envía una solicitud para unirte a la que más te guste.
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/family/find">
                            <Search className="mr-2 h-5 w-5" />
                            Buscar Familias Existentes
                        </Link>
                    </Button>
                 </div>
            </div>
        </div>
    )
}
