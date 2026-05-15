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
import { UOM_OPTIONS } from "@/lib/mock-data"
import { createProduct, updateProduct } from "@/lib/services/inventory"
import { fetchSuppliers } from "@/lib/services/suppliers"
import type { ProductDTO, SupplierDTO } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FormState {
  name: string
  sku: string
  sapCode: string
  description: string
  uom: string
  reorderPoint: string
  supplierId: number | null
}

const empty: FormState = {
  name: "",
  sku: "",
  sapCode: "",
  description: "",
  uom: "UNIDAD",
  reorderPoint: "0",
  supplierId: null,
}

export function AddItemModal({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: ProductDTO | null
  onSave: () => void
}) {
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([])

  useEffect(() => {
    if (open) {
      fetchSuppliers(0, 200).then((res) => setSuppliers(res.content ?? [])).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        sku: editing.sku,
        sapCode: editing.sapCode,
        description: editing.description,
        uom: editing.uom,
        reorderPoint: String(editing.reorderPoint),
        supplierId: editing.supplierId,
      })
    } else {
      setForm(empty)
    }
  }, [editing, open])

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name: form.name,
        sku: form.sku,
        sapCode: form.sapCode,
        description: form.description,
        uom: form.uom,
        reorderPoint: Number(form.reorderPoint) || 0,
        supplierId: form.supplierId,
      }
      if (editing) {
        await updateProduct(editing.id, data)
        toast.success("Producto actualizado")
      } else {
        await createProduct(data)
        toast.success("Producto creado")
      }
      onSave()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar producto")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {editing ? "Edit Item" : "Add New Item"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Actualiza la información del producto."
              : "Registra un nuevo producto en el catálogo de inventario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="desc">Descripción</Label>
            <Input
              id="desc"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              required
              value={form.sku}
              onChange={(e) => update("sku", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sap">SAP Code</Label>
            <Input
              id="sap"
              value={form.sapCode}
              onChange={(e) => update("sapCode", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label>UOM</Label>
            <Select value={form.uom} onValueChange={(v) => update("uom", v)} disabled={saving}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UOM_OPTIONS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reorder">Reorder Point</Label>
            <Input
              id="reorder"
              type="number"
              value={form.reorderPoint}
              onChange={(e) => update("reorderPoint", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Proveedor</Label>
            <Select
              value={form.supplierId ? String(form.supplierId) : ""}
              onValueChange={(v) => update("supplierId", v ? Number(v) : null)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin proveedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" disabled={saving}>
              {saving ? (
                <><Loader2 className="size-4 animate-spin" /> Guardando…</>
              ) : editing ? (
                "Guardar cambios"
              ) : (
                "Crear producto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
