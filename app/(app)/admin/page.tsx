"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchUsers, updateUser, deactivateUser, activateUser, deleteUser } from "@/lib/services/admin"
import { getCachedUser } from "@/lib/auth-client"
import { AreaManagerModal } from "@/components/visco/admin/area-manager-modal"
import { EmployeeManager } from "@/components/visco/admin/employee-manager"
import { InviteManager } from "@/components/visco/admin/invite-manager"
import type { UserDTO, UserRole } from "@/lib/types"
import { ArrowPathIcon, ShieldCheckIcon, ShieldExclamationIcon, BuildingOffice2Icon, UsersIcon, TrashIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { ROLE_LABELS, ROLE_BADGE } from "@/lib/config/roles"
import { canDelete } from "@/lib/permissions"
import { toast } from "sonner"

const ROLES: UserRole[] = [
  "WAREHOUSEMAN",
  "MANAGER",
  "PROCUREMENT",
  "ADMIN",
  "SUPERADMIN",
]

type Tab = "users" | "invites" | "employees"

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users")
  const [users, setUsers] = useState<UserDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null)
  const [newRole, setNewRole] = useState<UserRole | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingUser, setDeletingUser] = useState<UserDTO | null>(null)
  const [areaManagerOpen, setAreaManagerOpen] = useState(false)

  const currentUser = getCachedUser()

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchUsers(0, 100)
      setUsers(res.content ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleDeactivate = async (u: UserDTO) => {
    try {
      await deactivateUser(u.id)
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: false } : x)))
      toast.success(`${u.name} desactivado`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al desactivar")
    }
  }

  const handleActivate = async (u: UserDTO) => {
    try {
      await activateUser(u.id)
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: true } : x)))
      toast.success(`${u.name} activado`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al activar")
    }
  }

  const handleRoleChange = async () => {
    if (!editingUser || !newRole) return
    setSaving(true)
    try {
      const updated = await updateUser(editingUser.id, { role: newRole })
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      toast.success(`Rol de ${updated.name} actualizado a ${ROLE_LABELS[newRole] ?? newRole}`)
      setEditingUser(null)
      setNewRole(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar rol")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    setSaving(true)
    try {
      await deleteUser(deletingUser.id)
      setUsers((prev) => prev.filter((x) => x.id !== deletingUser.id))
      toast.success(`${deletingUser.name} eliminado permanentemente`)
      setDeletingUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar usuario")
    } finally {
      setSaving(false)
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "users", label: "Usuarios" },
    { key: "invites", label: "Invitaciones" },
    { key: "employees", label: "Empleados" },
  ]

  return (
    <div>
      <PageHeader
        title="Administración"
        subtitle="Gestión de usuarios, empleados y centros de costo."
        actions={
          <>
            <Button variant="outline" size="sm" className="bg-card" onClick={() => setAreaManagerOpen(true)}>
              <BuildingOffice2Icon className="size-4" /> Áreas
            </Button>
            <Button size="sm" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" onClick={loadUsers}>
              <ShieldCheckIcon className="size-4" /> Recargar
            </Button>
          </>
        }
      />

      <div className="flex gap-1 mb-4 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === t.key
                ? "border-[#7b1a1a] text-[#7b1a1a]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "invites" ? (
        <InviteManager />
      ) : tab === "employees" ? (
        <EmployeeManager />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
                    <th className="text-left font-medium px-5 py-3">Usuario</th>
                    <th className="text-left font-medium px-5 py-3">Email</th>
                    <th className="text-left font-medium px-5 py-3">Rol</th>
                    <th className="text-left font-medium px-5 py-3">Estado</th>
                    <th className="text-left font-medium px-5 py-3">Área</th>
                    <th className="text-left font-medium px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center">
                        <ArrowPathIcon className="size-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      return (
                        <tr
                          key={u.id}
                          className={cn(
                            "border-t border-border",
                            u.active === false ? "opacity-50" : "",
                          )}
                        >
                          <td className="px-5 py-3">
                            <div className="font-medium text-foreground">{u.name}</div>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                          <td className="px-5 py-3">
                            <Badge className={ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-700 ring-gray-200"}>{ROLE_LABELS[u.role]}</Badge>
                          </td>
                          <td className="px-5 py-3">
                            {u.active !== false ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                <ShieldCheckIcon className="size-3.5" /> Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-red-700">
                                <ShieldExclamationIcon className="size-3.5" /> Inactivo
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{u.costCenterName ?? u.costCenterId ? String(u.costCenterId) : "-"}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setEditingUser(u)
                                  setNewRole(u.role)
                                }}
                              >
                                Cambiar rol
                              </Button>
                              {u.active !== false ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-red-600 hover:text-red-700"
                                  onClick={() => handleDeactivate(u)}
                                  disabled={u.id === currentUser?.id}
                                >
                                  Desactivar
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-green-600 hover:text-green-700"
                                  onClick={() => handleActivate(u)}
                                >
                                  Reactivar
                                </Button>
                              )}
                              {canDelete(currentUser) && u.id !== currentUser?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-red-700 hover:text-red-800"
                                  onClick={() => setDeletingUser(u)}
                                  title="Eliminar permanentemente"
                                >
                                  <TrashIcon className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Dialog open={!!editingUser} onOpenChange={(o) => { if (!o) setEditingUser(null) }}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-serif">Cambiar rol de usuario</DialogTitle>
                <DialogDescription>
                  {editingUser?.name} &mdash; {editingUser?.email}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nuevo rol</label>
                <Select
                  value={newRole ?? ""}
                  onValueChange={(v) => setNewRole(v as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
                <Button
                  className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
                  onClick={handleRoleChange}
                  disabled={saving || !newRole}
                >
                  {saving ? <><ArrowPathIcon className="size-4 animate-spin" /> Guardando…</> : "Guardar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!deletingUser} onOpenChange={(o) => { if (!o) setDeletingUser(null) }}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-serif">Eliminar usuario permanentemente</DialogTitle>
                <DialogDescription>
                  Esta accion no se puede deshacer. Se eliminara a <strong>{deletingUser?.name}</strong> ({deletingUser?.email}) y todos sus datos asociados del sistema.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancelar</Button>
                <Button
                  className="bg-red-700 hover:bg-red-800 text-white"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  {saving ? <><ArrowPathIcon className="size-4 animate-spin" /> Eliminando…</> : "Eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      <AreaManagerModal
        open={areaManagerOpen}
        onOpenChange={setAreaManagerOpen}
      />
    </div>
  )
}
