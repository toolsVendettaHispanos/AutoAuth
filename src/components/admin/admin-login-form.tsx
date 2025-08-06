

'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { loginAdmin } from "@/lib/auth-admin";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function AdminLoginForm() {
    const [password, setPassword] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await loginAdmin(password);
            if (!result.success) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error,
                });
            }
        });
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                 <Image 
                    src="/logo.jpg"
                    alt="Vendetta Logo"
                    width={96} // w-24
                    height={48}
                    className="object-contain mx-auto mb-4"
                    data-ai-hint="game logo"
                />
                <CardTitle>Acceso de Administrador</CardTitle>
                <CardDescription>Introduce la contraseña para acceder al panel.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Entrar
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
