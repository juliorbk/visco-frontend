"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { RegisterRequest, UserRole, CostCenter } from "@/lib/types"


const ROLES: { value: UserRole; label: string }[] = [
  { value: "WAREHOUSEMAN", label: "Almacenista" },
  { value: "PROCUREMENT", label: "Compras" },
  { value: "MANAGER", label: "Gerente" },
  { value: "ADMIN", label: "Administrador" },
]

export function RegisterModal({
  open,
  onOpenChange,
  onRegistered,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onRegistered?: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("WAREHOUSEMAN")
  const [costCenterId, setCostCenterId] = useState<number | null>(null)
  const [showPwd, setShowPwd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])

useEffect(() => {
  if (open) {
    // Quita el ${BASE_URL}
    api.get<CostCenter[]>('/api/cost-centers/all')
      .then((data) => setCostCenters(data.filter((c) => c.active)))
      .catch(() => toast.error("Error al cargar centros de costo"))
  }
}, [open])

  const reset = () => {
    setName("")
    setEmail("")
    setPassword("")
    setRole("WAREHOUSEMAN")
    setCostCenterId(null)
    setShowPwd(false)
  }

  const close = () => {
    onOpenChange(false)
    setTimeout(reset, 200)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error("Completa todos los campos obligatorios")
      return
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }
    setSaving(true)
    try {
      const body: RegisterRequest = {
        name,
        email,
        password,
        role,
        costCenterId: costCenterId || null,
      }
      await api.post("/api/auth/register", body)
      toast.success(`Usuario ${name} registrado exitosamente`)
      onRegistered?.()
      close()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar usuario")
    } finally {
      setSaving(false)
    }
  }

  const pwdStrength = password.length === 0
    ? "empty"
    : password.length < 6
      ? "weak"
      : password.length < 10
        ? "medium"
        : "strong"

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <UserPlus className="size-5" />
            Registrar Usuario
          </DialogTitle>
          <DialogDescription>
            Crea una nueva cuenta de usuario para el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Nombre completo</Label>
            <Input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              placeholder="Ana Rodríguez"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Correo electrónico</Label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              placeholder="ana@visco.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-pwd">Contraseña</Label>
            <div className="relative">
              <Input
                id="reg-pwd"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={saving}
                placeholder="Mínimo 8 caracteres"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex gap-1 mt-1">
                {(["weak", "medium", "strong"] as const).map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      pwdStrength === level
                        ? level === "weak"
                          ? "bg-red-500"
                          : level === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                        : "bg-border"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Centro de costo</Label>
              <Select
                value={costCenterId ? String(costCenterId) : ""}
                onValueChange={(v) => setCostCenterId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.fullDescription}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              disabled={saving}
            >
              {saving ? (
                <><Loader2 className="size-4 animate-spin" /> Registrando…</>
              ) : (
                "Registrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
