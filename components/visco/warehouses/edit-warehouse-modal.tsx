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
import { Textarea } from "@/components/ui/textarea"
import { updateWarehouse } from "@/lib/services/warehouse"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"
import type { WarehouseDetailResponse } from "@/lib/types"

export function EditWarehouseModal({
  open,
  onOpenChange,
  warehouse,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  warehouse: WarehouseDetailResponse | null
  onUpdated: () => void
}) {
  const [name, setName] = useState("")
  const [physicalAddress, setPhysicalAddress] = useState("")
  const [description, setDescription] = useState("")
  const [sapCenterCode, setSapCenterCode] = useState("")
  const [responsibleUserId, setResponsibleUserId] = useState("")
  const [saving, setSaving] = useState(false)

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current ?? undefined)
  }, [])

  useEffect(() => {
    if (open && warehouse) {
      setName(warehouse.name ?? "")
      setPhysicalAddress(warehouse.physicalAddress ?? "")
      setDescription(warehouse.description ?? "")
      setSapCenterCode(warehouse.sapCenterCode ?? "")
      setResponsibleUserId(warehouse.responsibleUserId ?? "")
    }
  }, [open, warehouse])

  const close = () => {
    onOpenChange(false)
    clearTimeout(closeTimerRef.current ?? undefined)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!warehouse) return
    setSaving(true)
    try {
      await updateWarehouse(warehouse.id, {
        name,
        physicalAddress,
        description,
        sapCenterCode,
        responsibleUserId,
      })
      toast.success(`Almacén "${name}" actualizado`)
      onUpdated()
      close()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar almacén")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Editar Almacén</DialogTitle>
          <DialogDescription>
            Actualiza la información del almacén.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-wh-name">Nombre</Label>
            <Input id="edit-wh-name" required value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-wh-addr">Dirección física</Label>
            <Input id="edit-wh-addr" required value={physicalAddress} onChange={(e) => setPhysicalAddress(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-wh-desc">Descripción</Label>
            <Textarea id="edit-wh-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-wh-sap">Código SAP</Label>
            <Input id="edit-wh-sap" value={sapCenterCode} onChange={(e) => setSapCenterCode(e.target.value)} disabled={saving} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={close} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" disabled={saving}>
              {saving ? <><ArrowPathIcon className="size-4 animate-spin" /> Guardando…</> : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
