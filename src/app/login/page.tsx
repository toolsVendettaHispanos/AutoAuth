
'use client'

import { Suspense } from "react";
import Image from "next/image";
import { AuthForm } from "@/components/auth-form";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function AuthLoading() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}


export default function LoginPage() {

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
        <div className="absolute inset-0 z-0">
            <Image
                src="/img/general/fondo.jpg"
                alt="Fondo de la ciudad de Vendetta"
                fill
                className="object-cover"
                data-ai-hint="dark rainy city street"
                priority
            />
            <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-background via-black/50 to-transparent" />
        </div>
        
        <div className="z-10 flex flex-col items-center justify-center space-y-8">
            <Suspense fallback={<AuthLoading />}>
                <AuthForm />
            </Suspense>
        </div>
        <div className="absolute bottom-4 right-4 z-10">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Admin
            </Link>
        </div>
    </main>
  );
}