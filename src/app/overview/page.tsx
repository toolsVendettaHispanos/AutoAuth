
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Home, Settings, Bell, UserRound, LogOut, ShieldCheck } from "lucide-react";
import Link from 'next/link';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getUserProperties() {
  const user = await prisma.user.findUnique({
    where: {
        username: "bomberox"
    },
    include: {
        propiedades: true,
    }
  })

  if (!user) {
    // Handle case where user is not found, maybe return empty array or throw error
    return [];
  }
  
  // Flatten properties for easy display
  return user.propiedades.map(p => ({
    id: p.id,
    nombre: p.nombre,
    ciudad: p.ciudad,
    barrio: p.barrio,
    edificio: p.edificio,
    armas: String(p.armas),
    municion: String(p.municion),
    alcohol: String(p.alcohol),
    dolares: String(p.dolares),
    username: user.username,
  }));
}

export default async function OverviewPage() {
  const userProperties = await getUserProperties();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="w-64 border-r bg-card p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-8">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AutoAuth</h1>
        </div>
        <nav className="flex flex-col gap-2 flex-grow">
          <Button variant="ghost" className="justify-start gap-2 text-primary bg-primary/10 font-semibold">
            <Home className="h-5 w-5" />
            Overview
          </Button>
          <Button variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            Notifications
          </Button>
          <Button variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
            Settings
          </Button>
        </nav>
        <div className="mt-auto">
             <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Upgrade your plan</CardTitle>
                    <CardDescription className="text-sm">Get more features and enhance your security.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Upgrade</Button>
                </CardContent>
            </Card>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="lg:hidden">
                <Button variant="ghost" size="icon">
                    <Home className="w-6 h-6" />
                </Button>
            </div>
            <div className="flex-1 text-left">
                <h2 className="text-xl font-semibold">Welcome, bomberox!</h2>
            </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <UserRound className="h-6 w-6" />
            </Button>
            <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 bg-background">
            <div className="grid gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="text-primary"/> 
                            Authentication Successful
                        </CardTitle>
                        <CardDescription>
                        You have been successfully authenticated and are now on the overview dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-6 border rounded-lg bg-primary/5 text-sm">
                            <p className="text-foreground">
                                This is your secure area. You are logged in as <span className="font-semibold text-primary">bomberox</span>. From here you can manage your account and settings.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Properties</CardTitle>
                        <CardDescription>Details for the currently logged-in user from the database.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userProperties.map((item) => (
                                    <React.Fragment key={item.id}>
                                        <TableRow>
                                            <TableCell className="font-medium">Username</TableCell>
                                            <TableCell>{item.username}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Propiedad</TableCell>
                                            <TableCell>{item.nombre}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Ciudad</TableCell>
                                            <TableCell>{item.ciudad}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Barrio</TableCell>
                                            <TableCell>{item.barrio}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Edificio</TableCell>
                                            <TableCell>{item.edificio}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Armas</TableCell>
                                            <TableCell>{item.armas}</TableCell>
                                        </TableRow>
                                         <TableRow>
                                            <TableCell className="font-medium">Municion</TableCell>
                                            <TableCell>{item.municion}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Alcohol</TableCell>
                                            <TableCell>{item.alcohol}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Dolares</TableCell>
                                            <TableCell>{item.dolares}</TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
