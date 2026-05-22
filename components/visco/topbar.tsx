"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, Settings, Info, Search, LogOut, User, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { getCachedUser, fetchUser, clearUserCache } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter()
  const [user, setUser] = useState(() => getCachedUser())
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!user && !fetchedRef.current) {
      fetchedRef.current = true
      fetchUser().then(setUser)
    }
  }, [user])

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST" })
    } catch {
      // Proceed even if server call fails
    }
    clearUserCache()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 md:gap-4 border-b border-border bg-card px-3 md:px-6">
      <button
        onClick={onMenuClick}
        className="md:hidden size-9 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary shrink-0"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative flex-1 max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Buscar pedidos, productos, proveedores…"
          className={cn(
            "pl-9 bg-[#f5f5f7] border-transparent focus-visible:border-input",
            "max-md:w-full max-md:placeholder:text-xs",
          )}
          aria-label="Buscar"
        />
      </div>

      <div className="flex items-center gap-0.5 md:gap-1">
        <button
          className="size-9 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          aria-label="Notificaciones"
        >
          <Bell className="size-[18px]" />
        </button>
        <button
          className="size-9 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary max-md:hidden"
          aria-label="Configuración"
        >
          <Settings className="size-[18px]" />
        </button>
        <button
          className="size-9 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary max-md:hidden"
          aria-label="Ayuda"
        >
          <Info className="size-[18px]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 md:ml-2 outline-none">
            <Avatar className="size-8 md:size-9 ring-1 ring-border">
              <AvatarFallback className="bg-[#7b1a1a] text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name ?? "Usuario"}</span>
                {user?.email && (
                  <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                )}
                <span className="text-xs text-muted-foreground font-normal">
                  Rol: {user?.role ?? "—"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" /> Preferencias
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 size-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
