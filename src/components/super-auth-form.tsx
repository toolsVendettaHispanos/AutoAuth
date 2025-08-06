
'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { loginSuperUser } from "@/lib/actions/super-auth.actions";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function SuperAuthForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await loginSuperUser({username, password});
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error de Acceso',
                    description: result.error,
                });
            }
        });
    }

    return (
        <Card className="w-full max-w-sm bg-black/50 backdrop-blur-sm border border-white/10 shadow-lg shadow-primary/30 animate-fade-in">
            <CardHeader className="text-center">
                 <Image 
                    src="/logo.jpg"
                    alt="Vendetta Logo"
                    width={192} 
                    height={96}
                    className="object-contain mx-auto mb-4 animate-fade-in-up [filter:drop-shadow(0_0_8px_hsl(var(--primary)))]"
                    style={{ animationDelay: '100ms' }}
                />
                <CardTitle className="text-3xl font-heading tracking-wider animate-fade-in-up text-white/90" style={{ animationDelay: '200ms' }}>Acceso Protegido</CardTitle>
                <CardDescription className="animate-fade-in-up text-white/70" style={{ animationDelay: '300ms' }}>Introduce las credenciales de superusuario.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                     <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <Label htmlFor="username">Superusuario</Label>
                        <Input 
                            id="username" 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isPending}
                            required
                        />
                    </div>
                    <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isPending}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <Button type="submit" className="w-full transition-all duration-300 hover:scale-105 hover:shadow-primary/50" size="lg" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verificar Acceso
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
