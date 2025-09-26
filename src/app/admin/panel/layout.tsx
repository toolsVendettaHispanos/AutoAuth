

import { verifyAdminSession, logoutAdmin } from "@/lib/auth-admin";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, List, Shield, Swords, UserSearch, Users, Bot, Globe, LogOut } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


async function AdminSidebar() {
    const handleLogout = async () => {
        'use server';
        await logoutAdmin();
    }

    const navItems = [
        { href: "/admin/panel", label: "Inicio", icon: <Home className="h-5 w-5" /> },
        { href: "/admin/panel/rooms", label: "Habitaciones", icon: <List className="h-5 w-5" /> },
        { href: "/admin/panel/trainings", label: "Entrenamientos", icon: <Shield className="h-5 w-5" /> },
        { href: "/admin/panel/troops", label: "Tropas", icon: <Users className="h-5 w-5" /> },
        { href: "/admin/panel/bonus", label: "Matriz Bonus", icon: <Swords className="h-5 w-5" /> },
        { href: "/admin/panel/inspector", label: "Inspector", icon: <UserSearch className="h-5 w-5" /> },
        { href: "/admin/panel/global-view", label: "Visión Global", icon: <Globe className="h-5 w-5" /> },
        { href: "/admin/panel/ai", label: "AI", icon: <Bot className="h-5 w-5" /> },
    ];

    return (
         <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <TooltipProvider>
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Link
                        href="#"
                        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/logo.jpg" alt="Vendetta" />
                            <AvatarFallback>V</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Vendetta Admin</span>
                    </Link>
                    {navItems.map(item => (
                         <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                                >
                                    {item.icon}
                                    <span className="sr-only">{item.label}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </nav>
            </TooltipProvider>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <form action={handleLogout}>
                    <Button type="submit" variant="ghost" size="icon">
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Cerrar sesión</span>
                    </Button>
                </form>
            </nav>
        </aside>
    )
}

export default async function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAdmin = await verifyAdminSession();

    if (!isAdmin) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
                <AdminLoginForm />
            </main>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <AdminSidebar />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                     {children}
                </main>
            </div>
        </div>
    );
}




