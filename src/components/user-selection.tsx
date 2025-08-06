// This component is no longer used and can be deleted.
"use client";

import { useRouter } from 'next/navigation';
import type { User } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

interface UserSelectionProps {
  users: User[];
}

export function UserSelection({ users }: UserSelectionProps) {
  const router = useRouter();

  const handleUserSelect = (userId: string) => {
    // For now, we'll just redirect. In a real app, you'd handle session/auth.
    console.log(`User ${userId} selected`);
    // You can use localStorage to persist the user selection
    localStorage.setItem('selectedUserId', userId);
    router.push('/overview');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">¿Quién eres?</CardTitle>
        <CardDescription>Selecciona tu perfil para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user.id)}
              className="flex cursor-pointer items-center space-x-4 rounded-lg border p-4 transition-all hover:bg-muted/50"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl || 'https://placehold.co/100x100.png'} alt={user.name} data-ai-hint="mafia character" />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.title}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
