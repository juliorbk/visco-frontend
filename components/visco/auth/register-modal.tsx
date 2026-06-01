"use client"

import { useEffect, useRef, useState } from "react"
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
import { EyeIcon, EyeSlashIcon, ArrowPathIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"
import type {
  RegisterRequest,
  UserRole,
  CostCenter,
  ManagementDTO,
  GeneralManagementDTO,
} from "@/lib/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL


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
  const [selectedGgId, setSelectedGgId] = useState<number | null>(null)
  const [selectedMgmtId, setSelectedMgmtId] = useState<number | null>(null)
  const [showPwd, setShowPwd] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState(false)
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [managements, setManagements] = useState<ManagementDTO[]>([])
  const [generalManagements, setGeneralManagements] = useState<GeneralManagementDTO[]>([])

  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    if (!open) return
    Promise.all([
      fetch(`${BASE_URL}/api/cost-centers/all`, { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error()
        return r.json() as Promise<CostCenter[]>
      }),
      fetch(`${BASE_URL}/api/management`, { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error()
        return r.json() as Promise<ManagementDTO[]>
      }),
      fetch(`${BASE_URL}/api/general-management`, { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error()
        return r.json() as Promise<GeneralManagementDTO[]>
      }),
    ])
      .then(([cc, mgmt, gg]) => {
        setCostCenters(cc.filter((c) => c.isActive))
        setManagements(mgmt)
        setGeneralManagements(gg)
      })
      .catch(() => toast.error("Error al cargar datos"))
  }, [open])

  const filteredManagements = managements.filter(
    (m) => !selectedGgId || m.generalManagementId === selectedGgId,
  )

  const filteredCostCenters = costCenters.filter(
    (cc) => !selectedMgmtId || cc.managementId === selectedMgmtId,
  )

  const reset = () => {
    setName("")
    setEmail("")
    setPassword("")
    setRole("WAREHOUSEMAN")
    setCostCenterId(null)
    setSelectedGgId(null)
    setSelectedMgmtId(null)
    setShowPwd(false)
  }

  const close = () => {
    onOpenChange(false)
    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(reset, 200)
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
      const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      if (!regRes.ok) {
        const err = await regRes.json().catch(() => ({ error: `Error ${regRes.status}` }))
        const msg = err.errors?.[0]?.defaultMessage ?? err.error ?? err.detail ?? `Error ${regRes.status}`
        throw new Error(msg)
      }
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
      <DialogContent className="sm:max-w-lg max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <UserPlusIcon className="size-5" />
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
                {showPwd ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Select
                  value={selectedGgId ? String(selectedGgId) : ""}
                  onValueChange={(v) => {
                    setSelectedGgId(Number(v))
                    setSelectedMgmtId(null)
                    setCostCenterId(null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gerencia General…" />
                  </SelectTrigger>
                  <SelectContent>
                    {generalManagements.map((gg) => (
                      <SelectItem key={gg.id} value={String(gg.id)}>
                        {gg.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedMgmtId ? String(selectedMgmtId) : ""}
                  onValueChange={(v) => {
                    setSelectedMgmtId(Number(v))
                    setCostCenterId(null)
                  }}
                  disabled={!selectedGgId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gerencia…" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredManagements.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={costCenterId ? String(costCenterId) : ""}
                  onValueChange={(v) => setCostCenterId(Number(v))}
                  disabled={!selectedMgmtId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Centro de Costo…" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCostCenters.map((cc) => (
                      <SelectItem key={cc.id} value={String(cc.id)}>
                        {cc.fullDescription}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <><ArrowPathIcon className="size-4 animate-spin" /> Registrando…</>
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
