
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Terminal } from 'lucide-react';
import { login, registerUser } from '@/lib/actions/auth.actions';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

export function AuthForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoginView, setIsLoginView] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Common state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Registration state
    const [step, setStep] = useState(1);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [locationType, setLocationType] = useState('random');
    const [manualLocation, setManualLocation] = useState({ ciudad: 1, barrio: 1, edificio: 1 });


    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        setStep(2);
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLoginView) {
             startTransition(async () => {
                const result = await login({ username, password });
                if (result.error) {
                    setError(result.error);
                } else {
                    toast({ title: "Inicio de sesión exitoso", description: "Bienvenido de nuevo, Jefe." });
                    router.push('/overview');
                    router.refresh();
                }
            });
        } else {
            // Registration logic
            startTransition(async () => {
                const location = locationType === 'manual' 
                    ? manualLocation 
                    : { ciudad: Math.floor(Math.random() * 50) + 1, barrio: Math.floor(Math.random() * 50) + 1, edificio: Math.floor(Math.random() * 255) + 1 };

                const result = await registerUser({
                    username,
                    password,
                    location
                });

                if (result.error) {
                    setError(result.error);
                    setStep(1); // Go back to fix credentials if username is taken, for example
                } else {
                    toast({ title: "¡Registro exitoso!", description: `Bienvenido a Vendetta, ${username}.` });
                    router.push('/overview');
                    router.refresh();
                }
            });
        }
    };
    
    const handleLocationChange = (field: 'ciudad' | 'barrio' | 'edificio', value: string) => {
        const numValue = parseInt(value, 10);
        let clampedValue = isNaN(numValue) ? 1 : numValue;

        if (field === 'ciudad' || field === 'barrio') {
            clampedValue = Math.max(1, Math.min(clampedValue, 50));
        } else if (field === 'edificio') {
            clampedValue = Math.max(1, Math.min(clampedValue, 255));
        }
        
        setManualLocation(l => ({ ...l, [field]: clampedValue }));
    }

    const renderLogin = () => (
        <form onSubmit={handleSubmit}>
            <CardHeader className="text-center">
                <CardTitle className="text-4xl font-heading tracking-widest text-white/90">INICIAR SESIÓN</CardTitle>
                <CardDescription className="text-white/70">Introduce tus credenciales para acceder a tu imperio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <Label htmlFor="username-login">Usuario</Label>
                    <Input id="username-login" name="username" type="text" placeholder="Tu nombre de guerra" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isPending} />
                </div>
                <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <Label htmlFor="password-login">Contraseña</Label>
                    <Input id="password-login" name="password" type="password" placeholder="Tu código secreto" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isPending} />
                </div>
                 {error && (
                    <Alert variant="destructive" className="bg-destructive/20 border-destructive/50 text-destructive-foreground">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button type="submit" variant="destructive" className="w-full transition-all hover:scale-105" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                </Button>
            </CardFooter>
        </form>
    );

    const renderRegisterStep1 = () => (
         <form onSubmit={handleNextStep}>
            <CardHeader className="text-center">
                <CardTitle className="text-4xl font-heading tracking-widest text-white/90">CREAR CUENTA</CardTitle>
                <CardDescription className="text-white/70">(Paso 1/2) - Elige tus credenciales de acceso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <Label htmlFor="username-register">Usuario</Label>
                    <Input id="username-register" name="username" type="text" placeholder="Tu nombre de guerra" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <Label htmlFor="password-register">Contraseña</Label>
                    <Input id="password-register" name="password" type="password" placeholder="Tu código secreto (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input id="confirm-password" type="password" placeholder="Repite tu código secreto" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                {error && (
                    <Alert variant="destructive" className="bg-destructive/20 border-destructive/50 text-destructive-foreground">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                <Button type="submit" variant="destructive" className="w-full transition-all hover:scale-105">Siguiente</Button>
            </CardFooter>
        </form>
    );

    const renderRegisterStep2 = () => (
        <form onSubmit={handleSubmit}>
            <CardHeader className="text-center">
                <CardTitle className="text-4xl font-heading tracking-widest text-white/90">CREAR CUENTA</CardTitle>
                <CardDescription className="text-white/70">(Paso 2/2) - Elige la ubicación de tu primera propiedad.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <RadioGroup value={locationType} onValueChange={setLocationType} className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="random" id="random" />
                        <Label htmlFor="random">Ubicación Aleatoria (Recomendado)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual">Ubicación Manual</Label>
                    </div>
                </RadioGroup>

                {locationType === 'manual' && (
                    <div className="grid grid-cols-3 gap-2 p-4 border rounded-md animate-fade-in">
                        <div className="space-y-1">
                            <Label htmlFor="ciudad" className="text-xs">Ciudad</Label>
                            <Input id="ciudad" type="number" min="1" max="50" value={manualLocation.ciudad} onChange={(e) => handleLocationChange('ciudad', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="barrio" className="text-xs">Barrio</Label>
                            <Input id="barrio" type="number" min="1" max="50" value={manualLocation.barrio} onChange={(e) => handleLocationChange('barrio', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edificio" className="text-xs">Edificio</Label>
                            <Input id="edificio" type="number" min="1" max="255" value={manualLocation.edificio} onChange={(e) => handleLocationChange('edificio', e.target.value)} />
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" variant="destructive" className="w-full transition-all hover:scale-105" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar y Entrar al Juego
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} disabled={isPending}>Volver</Button>
            </CardFooter>
        </form>
    );

    return (
        <Card className="w-full max-w-md bg-background/90 text-white border-white/10 backdrop-blur-md animate-fade-in shadow-lg shadow-primary/20">
           {isLoginView 
            ? renderLogin() 
            : (step === 1 ? renderRegisterStep1() : renderRegisterStep2())
           }
            <CardFooter className="flex-col gap-4 border-t pt-4">
                 <p className="text-xs text-center text-white/60">
                    {isLoginView ? '¿No tienes una cuenta?' : '¿Ya eres parte de la familia?'}
                    <Button variant="link" type="button" size="sm" className="p-0 h-auto ml-1 text-accent" onClick={() => { setIsLoginView(!isLoginView); setError(''); setStep(1); }}>
                         {isLoginView ? 'Regístrate aquí.' : 'Inicia sesión.'}
                    </Button>
                </p>
            </CardFooter>
        </Card>
    );
}

    