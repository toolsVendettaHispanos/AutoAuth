

"use client"

import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LogOut, Swords } from "lucide-react"
import type { UserWithProgress } from "@/lib/types"
import { logout } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation"

export function DashboardClientLayout({
    user,
    children,
    resourceBar
  }: {
    user: UserWithProgress | null;
    children: React.ReactNode
    resourceBar: React.ReactNode;
  }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Sidebar className="bg-card/80 backdrop-blur-sm border-r-white/10">
        <SidebarHeader>
           <Link href="/overview" className="flex items-center gap-2 p-2">
            <Swords className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold font-heading tracking-tight text-foreground">VENDETTA</h2>
           </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav user={user} />
        </SidebarContent>
        <Separator />
        <SidebarFooter>
          <div className="flex items-center gap-4 p-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={user?.avatarUrl || "https://placehold.co/40x40.png"} alt={user?.name || "Boss"} data-ai-hint="mafia boss" />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'V'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
                <span className="font-heading text-lg font-bold tracking-wide">{user?.name || "El Padrino"}</span>
                <span className="text-xs text-muted-foreground">{user?.title || "Jefe"}</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto hover:bg-destructive/20 hover:text-destructive" onClick={handleLogout}>
                <LogOut />
                <span className="sr-only">Cerrar Sesión</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        {/* Main Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <div className="flex items-center gap-2 md:hidden">
                <Link href="/overview" className="flex items-center gap-2">
                    <Swords className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-lg">Vendetta</span>
                </Link>
            </div>
             <div className="flex-1" />
            <SidebarTrigger className="md:hidden" />
        </header>
        {resourceBar}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
