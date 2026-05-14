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
import { CATEGORIES, UOM_OPTIONS, suppliers, type Product } from "@/lib/mock-data"

interface FormState {
  name: string
  sku: string
  sapCode: string
  category: string
  supplierId: string
  uom: string
  reorderPoint: string
  currentStock: string
  unitPrice: string
  warehouse: string
}

const empty: FormState = {
  name: "",
  sku: "",
  sapCode: "",
  category: CATEGORIES[0],
  supplierId: suppliers[0].id,
  uom: "UNIDAD",
  reorderPoint: "0",
  currentStock: "0",
  unitPrice: "0",
  warehouse: "Almacén Central",
}

export function AddItemModal({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Product | null
  onSave: (data: Omit<Product, "id" | "history">, id?: string) => void
}) {
  const [form, setForm] = useState<FormState>(empty)

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        sku: editing.sku,
        sapCode: editing.sapCode,
        category: editing.category,
        supplierId: editing.supplierId,
        uom: editing.uom,
        reorderPoint: String(editing.reorderPoint),
        currentStock: String(editing.currentStock),
        unitPrice: String(editing.unitPrice),
        warehouse: editing.warehouse,
      })
    } else {
      setForm(empty)
    }
  }, [editing, open])

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const supplier = suppliers.find((s) => s.id === form.supplierId)!
    onSave(
      {
        name: form.name,
        sku: form.sku,
        sapCode: form.sapCode,
        category: form.category,
        supplierId: supplier.id,
        supplierName: supplier.name,
        uom: form.uom,
        reorderPoint: Number(form.reorderPoint) || 0,
        currentStock: Number(form.currentStock) || 0,
        unitPrice: Number(form.unitPrice) || 0,
        warehouse: form.warehouse,
      },
      editing?.id,
    )
    onOpenChange(false)
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
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              required
              value={form.sku}
              onChange={(e) => update("sku", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sap">SAP Code</Label>
            <Input
              id="sap"
              value={form.sapCode}
              onChange={(e) => update("sapCode", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Proveedor</Label>
            <Select value={form.supplierId} onValueChange={(v) => update("supplierId", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>UOM</Label>
            <Select value={form.uom} onValueChange={(v) => update("uom", v)}>
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
            <Label htmlFor="warehouse">Almacén</Label>
            <Input
              id="warehouse"
              value={form.warehouse}
              onChange={(e) => update("warehouse", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reorder">Reorder Point</Label>
            <Input
              id="reorder"
              type="number"
              value={form.reorderPoint}
              onChange={(e) => update("reorderPoint", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stock">Stock actual</Label>
            <Input
              id="stock"
              type="number"
              value={form.currentStock}
              onChange={(e) => update("currentStock", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price">Precio unitario (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => update("unitPrice", e.target.value)}
            />
          </div>

          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white">
              {editing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
