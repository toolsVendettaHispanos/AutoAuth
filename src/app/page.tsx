"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock authentication function to simulate an API call
async function attemptLogin(user: string, pass: string): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(user === 'bomberox' && pass === '123456789');
    }, 1500); // Simulate a 1.5-second network delay
  });
}

export default function AutoAuthPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const authenticateAndRedirect = async () => {
      const isAuthenticated = await attemptLogin('bomberox', '123456789');

      if (isAuthenticated) {
        router.replace('/overview');
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "The provided credentials are incorrect.",
        });
      }
    };

    authenticateAndRedirect();
  }, [router, toast]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Securely signing you in
          </h1>
          <p className="text-muted-foreground">
            Please wait while we verify your credentials.
          </p>
        </div>
      </div>
    </main>
  );
}
