'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login, LoginFormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="accent" type="submit" className="w-full" aria-disabled={pending}>
      {pending ? 'Authenticating...' : 'Sign In'}
    </Button>
  );
}

export function LoginForm() {
  const initialState: LoginFormState = undefined;
  const [state, dispatch] = useActionState(login, initialState);

  return (
    <Card className="w-full max-w-sm border-2 border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Vendetta</CardTitle>
        <CardDescription>
          Enter your credentials to access the command center
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="operative-id"
              defaultValue="bomberox"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              defaultValue="123456789"
              required
            />
          </div>

          {state?.message && (
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Authentication Error</AlertTitle>
               <AlertDescription>{state.message}</AlertDescription>
             </Alert>
          )}
          
          <LoginButton />
        </form>
      </CardContent>
    </Card>
  );
}
