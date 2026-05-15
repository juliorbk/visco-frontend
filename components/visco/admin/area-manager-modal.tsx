"use client"

import { useCallback, useEffect, useState } from "react"
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
import { fetchAreas, createArea, updateArea, deactivateArea, activateArea } from "@/lib/services/requesting-areas"
import type { RequestingArea } from "@/lib/types"
import { Loader2, Plus, Pencil, ShieldCheck, ShieldX } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AreaManagerModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [areas, setAreas] = useState<RequestingArea[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newCostCenter, setNewCostCenter] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editCostCenter, setEditCostCenter] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchAreas(0, 100)
      setAreas(res.content ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar áreas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const handleCreate = async () => {
    if (!newName.trim() || !newCostCenter.trim()) {
      toast.error("Nombre y centro de costo son obligatorios")
      return
    }
    setSaving(true)
    try {
      await createArea({ name: newName.trim(), description: newDescription.trim(), costCenter: newCostCenter.trim() })
      toast.success(`Área "${newName}" creada`)
      setNewName(""); setNewDescription(""); setNewCostCenter("")
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear área")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: number) => {
    if (!editName.trim() || !editCostCenter.trim()) return
    setSaving(true)
    try {
      await updateArea(id, { name: editName.trim(), description: editDesc.trim(), costCenter: editCostCenter.trim() })
      toast.success("Área actualizada")
      setEditingId(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (a: RequestingArea) => {
    try {
      if (a.active) {
        await deactivateArea(a.id)
        toast.success(`Área "${a.name}" desactivada`)
      } else {
        await activateArea(a.id)
        toast.success(`Área "${a.name}" activada`)
      }
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar estado")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Gestionar Áreas Solicitantes</DialogTitle>
          <DialogDescription>
            Administra los departamentos o centros de costo que pueden solicitar compras.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border p-3 space-y-2 bg-[#fafafa]">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Nueva área</h4>
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Nombre" value={newName} onChange={(e) => setNewName(e.target.value)} size={1} />
            <Input placeholder="Centro de costo" value={newCostCenter} onChange={(e) => setNewCostCenter(e.target.value)} />
            <Button size="sm" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" onClick={handleCreate} disabled={saving}>
              <Plus className="size-4" /> Agregar
            </Button>
          </div>
          <Input placeholder="Descripción (opcional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center"><Loader2 className="size-5 animate-spin mx-auto" /></div>
          ) : areas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin áreas registradas.</p>
          ) : (
            areas.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                {editingId === a.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm w-1/3" />
                    <Input value={editCostCenter} onChange={(e) => setEditCostCenter(e.target.value)} className="h-8 text-sm w-1/4" />
                    <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8 text-sm flex-1" />
                    <Button size="sm" variant="outline" onClick={() => handleUpdate(a.id)} disabled={saving}>OK</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>X</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{a.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{a.costCenter}</span>
                      {a.description && <span className="text-xs text-muted-foreground ml-2">— {a.description}</span>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setEditingId(a.id); setEditName(a.name); setEditDesc(a.description); setEditCostCenter(a.costCenter) }}
                        className="size-7 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(a)}
                        className={cn(
                          "size-7 grid place-items-center rounded-md",
                          a.active ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50",
                        )}
                      >
                        {a.active ? <ShieldCheck className="size-3.5" /> : <ShieldX className="size-3.5" />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
