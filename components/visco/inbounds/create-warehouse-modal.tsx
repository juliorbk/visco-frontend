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
import { createWarehouse } from "@/lib/services/warehouse"
import { getCachedUser } from "@/lib/auth-client"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

export function CreateWarehouseModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: () => void
}) {
  const [name, setName] = useState("")
  const [physicalAddress, setPhysicalAddress] = useState("")
  const [description, setDescription] = useState("")
  const [sapCenterCode, setSapCenterCode] = useState("")
  const [saving, setSaving] = useState(false)

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current)
  }, [])

  const reset = () => {
    setName("")
    setPhysicalAddress("")
    setDescription("")
    setSapCenterCode("")
  }

  const close = () => {
    onOpenChange(false)
    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(reset, 200)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCachedUser()
    if (!user) {
      toast.error("Debes iniciar sesión")
      return
    }
    setSaving(true)
    try {
      await createWarehouse({
        name,
        physicalAddress,
        description,
        responsibleUserId: user.id,
        sapCenterCode,
      })
      toast.success(`Almacén "${name}" creado`)
      onCreated()
      close()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear almacén")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Nuevo Almacén</DialogTitle>
          <DialogDescription>
            Registra un nuevo almacén en el sistema de gestión de inventario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wh-name">Nombre</Label>
            <Input id="wh-name" required value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-addr">Dirección física</Label>
            <Input id="wh-addr" required value={physicalAddress} onChange={(e) => setPhysicalAddress(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-desc">Descripción</Label>
            <Textarea id="wh-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wh-sap">Código SAP (opcional)</Label>
            <Input id="wh-sap" value={sapCenterCode} onChange={(e) => setSapCenterCode(e.target.value)} disabled={saving} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={close} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" disabled={saving}>
              {saving ? <><ArrowPathIcon className="size-4 animate-spin" /> Creando…</> : "Crear Almacén"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
