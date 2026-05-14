"use client"

import { useMemo } from "react"
import { Bell, Settings, Info, Search, LogOut, User } from "lucide-react"
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
import { getUser, removeToken } from "@/lib/auth-client"

export function Topbar() {
  const router = useRouter()
  const user = useMemo(() => getUser(), [])

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
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Proceed with client-side logout even if server call fails
    }
    removeToken()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      <div className="relative flex-1 max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Buscar pedidos, productos, proveedores…"
          className="pl-9 bg-[#f5f5f7] border-transparent focus-visible:border-input"
          aria-label="Buscar"
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          className="size-9 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          aria-label="Notificaciones"
        >
          <Bell className="size-[18px]" />
        </button>
        <button
          className="size-9 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          aria-label="Configuración"
        >
          <Settings className="size-[18px]" />
        </button>
        <button
          className="size-9 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          aria-label="Ayuda"
        >
          <Info className="size-[18px]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-2 outline-none">
            <Avatar className="size-9 ring-1 ring-border">
              <AvatarFallback className="bg-[#7b1a1a] text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name ?? "Usuario"}</span>
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
