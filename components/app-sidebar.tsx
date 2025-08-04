"use client"

import { BarChart3, Car, DollarSign, Home, Moon, Sun, FileText, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Registro",
    url: "/registro",
    icon: DollarSign,
  },
  {
    title: "Estadísticas",
    url: "/estadisticas",
    icon: BarChart3,
  },
  {
    title: "Informes",
    url: "/informes",
    icon: FileText,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Car className="h-6 w-6" />
          <span className="font-semibold">Uber Driver</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full"
          >
            {!mounted ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Cambiar Tema
              </>
            ) : theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Tema Claro
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Tema Oscuro
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <User className="h-3 w-3" />
            <a
              href="https://enzo-meneghini.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Desarrollado por Enzo Meneghini
            </a>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
