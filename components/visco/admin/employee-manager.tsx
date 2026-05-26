"use client"

import { useCallback, useEffect, useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  activateEmployee,
} from "@/lib/services/employees"
import { fetchCostCenters } from "@/lib/services/requisitions"
import { fetchAllManagements, fetchAllGeneralManagements } from "@/lib/services/admin"
import type {
  EmployeeDTO,
  EmployeeRequest,
  CostCenter,
  ManagementDTO,
  GeneralManagementDTO,
} from "@/lib/types"
import { Loader2, Plus, ShieldCheck, ShieldX } from "lucide-react"
import { toast } from "sonner"

export function EmployeeManager() {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [generalManagements, setGeneralManagements] = useState<GeneralManagementDTO[]>([])
  const [managements, setManagements] = useState<ManagementDTO[]>([])
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])

  const [selectedGgId, setSelectedGgId] = useState<number | null>(null)
  const [selectedMgmtId, setSelectedMgmtId] = useState<number | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDTO | null>(null)
  const [formData, setFormData] = useState<EmployeeRequest>({
    fullName: "",
    documentNumber: "",
    phone: "",
    costCenterId: null,
    isActive: true,
  })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [empRes, ccRes, mgmtRes, ggRes] = await Promise.all([
        fetchEmployees(0, 200),
        fetchCostCenters(),
        fetchAllManagements(),
        fetchAllGeneralManagements(),
      ])
      setEmployees(empRes.content ?? [])
      setCostCenters(ccRes)
      setManagements(mgmtRes)
      setGeneralManagements(ggRes)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredManagements = managements.filter(
    (m) => !selectedGgId || m.generalManagementId === selectedGgId,
  )

  const filteredCostCenters = costCenters.filter(
    (cc) => !selectedMgmtId || cc.managementId === selectedMgmtId,
  )

  const openCreate = () => {
    setEditingEmployee(null)
    setFormData({ fullName: "", documentNumber: "", phone: "", costCenterId: null, isActive: true })
    setSelectedGgId(null)
    setSelectedMgmtId(null)
    setModalOpen(true)
  }

  const openEdit = (emp: EmployeeDTO) => {
    setEditingEmployee(emp)
    setFormData({
      fullName: emp.fullName,
      documentNumber: emp.documentNumber,
      phone: emp.phone ?? "",
      costCenterId: emp.costCenterId,
      isActive: emp.isActive,
    })
    if (emp.costCenterId) {
      const cc = costCenters.find((c) => c.id === emp.costCenterId)
      if (cc) {
        setSelectedGgId(cc.generalManagementId)
        setSelectedMgmtId(cc.managementId)
      } else {
        setSelectedGgId(null)
        setSelectedMgmtId(null)
      }
    } else {
      setSelectedGgId(null)
      setSelectedMgmtId(null)
    }
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.fullName || !formData.documentNumber) {
      toast.error("Nombre y documento son obligatorios")
      return
    }
    setSaving(true)
    try {
      if (editingEmployee) {
        const updated = await updateEmployee(editingEmployee.id, formData)
        setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
        toast.success("Empleado actualizado")
      } else {
        const created = await createEmployee(formData)
        setEmployees((prev) => [...prev, created])
        toast.success("Empleado creado")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar empleado")
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (emp: EmployeeDTO) => {
    try {
      await deactivateEmployee(emp.id)
      setEmployees((prev) => prev.map((e) => (e.id === emp.id ? { ...e, isActive: false } : e)))
      toast.success(`${emp.fullName} desactivado`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al desactivar")
    }
  }

  const handleActivate = async (emp: EmployeeDTO) => {
    try {
      await activateEmployee(emp.id)
      setEmployees((prev) => prev.map((e) => (e.id === emp.id ? { ...e, isActive: true } : e)))
      toast.success(`${emp.fullName} activado`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al activar")
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Gestión de empleados, tallas y centros de costo.
        </p>
        <Button size="sm" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" onClick={openCreate}>
          <Plus className="size-4" /> Nuevo Empleado
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
                <th className="text-left font-medium px-5 py-3">Nombre</th>
                <th className="text-left font-medium px-5 py-3">Documento</th>
                <th className="text-left font-medium px-5 py-3">Teléfono</th>
                <th className="text-left font-medium px-5 py-3">Centro de Costo</th>
                <th className="text-left font-medium px-5 py-3">Estado</th>
                <th className="text-left font-medium px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    <Loader2 className="size-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No hay empleados registrados.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-t border-border">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">{emp.fullName}</div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{emp.documentNumber}</td>
                    <td className="px-5 py-3 text-muted-foreground">{emp.phone ?? "-"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{emp.costCenterDescription ?? "-"}</td>
                    <td className="px-5 py-3">
                      {emp.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700">
                          <ShieldCheck className="size-3.5" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-700">
                          <ShieldX className="size-3.5" /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(emp)}>
                          Editar
                        </Button>
                        {emp.isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-600 hover:text-red-700"
                            onClick={() => handleDeactivate(emp)}
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-green-600 hover:text-green-700"
                            onClick={() => handleActivate(emp)}
                          >
                            Reactivar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) setModalOpen(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee ? "Actualiza los datos del empleado." : "Registra un nuevo empleado en el sistema."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Nombre del empleado"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Documento</Label>
                <Input
                  value={formData.documentNumber}
                  onChange={(e) => setFormData((p) => ({ ...p, documentNumber: e.target.value }))}
                  placeholder="Cédula / RIF"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input
                  value={formData.phone ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Centro de Costo</Label>

              <Select
                value={selectedGgId ? String(selectedGgId) : ""}
                onValueChange={(v) => {
                  setSelectedGgId(Number(v))
                  setSelectedMgmtId(null)
                  setFormData((p) => ({ ...p, costCenterId: null }))
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
                  setFormData((p) => ({ ...p, costCenterId: null }))
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
                value={formData.costCenterId ? String(formData.costCenterId) : ""}
                onValueChange={(v) => setFormData((p) => ({ ...p, costCenterId: Number(v) }))}
                disabled={!selectedMgmtId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Centro de Costo…" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCostCenters
                    .filter((cc) => cc.isActive)
                    .map((cc) => (
                      <SelectItem key={cc.id} value={String(cc.id)}>
                        {cc.fullDescription}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <><Loader2 className="size-4 animate-spin" /> Guardando…</> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
