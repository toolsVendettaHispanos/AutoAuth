"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  useSidebar,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { 
    Home, 
    DoorOpen, 
    Users, 
    Shield, 
    Target, 
    Search, 
    FlaskConical, 
    Users2, 
    Package, 
    Map, 
    ClipboardList, 
    Calculator, 
    Mail, 
    BarChart, 
    Trophy,
    Settings,
    Swords,
    Building2,
    Globe
} from "lucide-react"
import { PropertySelector } from "./property-selector"
import type { UserWithProgress } from "@/lib/types"
import { useProperty } from "@/contexts/property-context"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarNavProps {
    user: UserWithProgress | null;
}

const mainNav: NavItem[] = [
  { href: "/overview", label: "Visión General", icon: <Home /> },
  { href: "/rooms", label: "Habitaciones", icon: <DoorOpen /> },
  { href: "/recruitment", label: "Reclutamiento", icon: <Users /> },
  { href: "/training", label: "Entrenamiento", icon: <Target /> },
  { href: "/security", label: "Seguridad", icon: <Shield /> },
  { href: "/missions", label: "Misiones", icon: <ClipboardList /> },
]

const secondaryNav: NavItem[] = [
    { href: "/vision/global", label: "Visión Global", icon: <Globe /> },
    { href: "/buildings", label: "Edificios", icon: <Building2 /> },
    { href: "/technologies", label: "Tecnologías", icon: <FlaskConical /> },
    { href: "/family", label: "Familia", icon: <Users2 /> },
    { href: "/resources", label: "Recursos", icon: <Package /> },
    { href: "/map", label: "Mapa", icon: <Map /> },
    { href: "/simulator", label: "Simulador", icon: <Calculator /> },
    { href: "/brawls", label: "Batallas", icon: <Swords /> },
]

const tertiaryNav: NavItem[] = [
    { href: "/messages", label: "Notificaciones", icon: <Mail /> },
    { href: "/statistics", label: "Estadísticas", icon: <BarChart /> },
    { href: "/rankings", label: "Clasificaciones", icon: <Trophy /> },
    { href: "/settings", label: "Ajustes", icon: <Settings /> },
    { href: "/search", label: "Buscar", icon: <Search /> },
]

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const { selectedProperty } = useProperty();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
        setOpenMobile(false)
    }
  }

  const renderNav = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        
        let finalHref = item.href;
        if(item.href === '/rooms' && selectedProperty) {
            finalHref = `/rooms/${selectedProperty.ciudad}:${selectedProperty.barrio}:${selectedProperty.edificio}`;
        }

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              as={Link}
              href={finalHref}
              isActive={isActive}
              tooltip={{
                children: item.label,
                side: "right",
                align: "center",
              }}
              onClick={handleClick}
              className={cn("h-11 text-base hover:pl-4 relative [&>svg]:size-5", 
              isActive && "bg-primary/20 text-primary hover:bg-primary/30 border-l-4 border-primary"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wider text-muted-foreground/80">Principal</SidebarGroupLabel>
        {renderNav(mainNav)}
      </SidebarGroup>
      
      {user && user.propiedades.length > 0 && <PropertySelector properties={user.propiedades} />}

      <SidebarGroup>
         <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wider text-muted-foreground/80">Juego</SidebarGroupLabel>
        {renderNav(secondaryNav)}
      </SidebarGroup>
      
      <SidebarGroup>
         <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wider text-muted-foreground/80">Comunidad</SidebarGroupLabel>
        {renderNav(tertiaryNav)}
      </SidebarGroup>
    </>
  )
}
