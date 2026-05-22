"use client"

import { useEffect, useMemo, useState } from "react"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createProduct, updateProduct } from "@/lib/services/inventory"
import { fetchSuppliers } from "@/lib/services/suppliers"
import { fetchCategories } from "@/lib/services/categories"
import type { ProductDTO, SupplierDTO, Category } from "@/lib/types"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FormState {
  name: string
  sku: string
  sapCode: string
  description: string
  // Extraemos el tipo exacto de tu DTO
  uom: ProductDTO["uom"] 
  reorderPoint: string
  supplierId: number | null
  categoryId: number | null
}

const empty: FormState = {
  name: "",
  sku: "",
  sapCode: "",
  description: "",
  // Casteamos el valor inicial
  uom: "UNIDAD" as ProductDTO["uom"], 
  reorderPoint: "0",
  supplierId: null,
  categoryId: null,
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
  const [categories, setCategories] = useState<Category[]>([])

  // Estados para controlar si el Combobox está abierto o cerrado
  const [openSupplier, setOpenSupplier] = useState(false)
  const [openCategory, setOpenCategory] = useState(false)

  useEffect(() => {
    if (open) {
      if (suppliers.length === 0) {
        fetchSuppliers(0, 200).then((res) => setSuppliers(res.content ?? [])).catch(() => {})
      }
      if (categories.length === 0) {
        fetchCategories(0, 200).then((res) => setCategories(res.content ?? [])).catch(() => {})
      }
    }
  }, [open, suppliers.length, categories.length])

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        sku: editing.sku,
        sapCode: editing.sapCode ?? "",
        description: editing.description ?? "",
        uom: editing.uom,
        reorderPoint: String(editing.reorderPoint),
        supplierId: editing.supplierId,
        categoryId: editing.categoryId,
      })
    } else {
      setForm(empty)
    }
  }, [editing, open])

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const mainCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories],
  )

  const subCategoriesByParent = useMemo(() => {
    const map = new Map<number, Category[]>()
    categories.forEach((c) => {
      if (c.parentId !== null) {
        if (!map.has(c.parentId)) map.set(c.parentId, [])
        map.get(c.parentId)!.push(c)
      }
    })
    return map
  }, [categories])

const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name: form.name,
        sku: form.sku,
        sapCode: form.sapCode,
        description: form.description,
        uom: form.uom as ProductDTO["uom"], 
        reorderPoint: Number(form.reorderPoint) || 0,
        supplierId: form.supplierId,
        categoryId: form.categoryId,
      }
      
      // Faltaba esta parte: llamar a la API y notificar
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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
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

          {/* COMBOBOX DE PROVEEDOR */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <Label>Proveedor</Label>
            <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSupplier}
                  className="w-full justify-between font-normal bg-background"
                  disabled={saving}
                >
                  {form.supplierId
                    ? suppliers.find((s) => s.id === form.supplierId)?.name
                    : "Seleccionar proveedor..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar proveedor..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
                    <CommandGroup>
                      {suppliers.map((s) => (
                        <CommandItem
                          key={s.id}
                          value={s.name}
                          onSelect={() => {
                            // Si toca el mismo que ya está, lo deselecciona
                            update("supplierId", s.id === form.supplierId ? null : s.id)
                            setOpenSupplier(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.supplierId === s.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {s.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* COMBOBOX DE CATEGORÍA */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <Label>Categoría</Label>
            <Popover open={openCategory} onOpenChange={setOpenCategory}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCategory}
                  className="w-full justify-between font-normal bg-background"
                  disabled={saving}
                >
                  {form.categoryId
                    ? categories.find((c) => c.id === form.categoryId)?.name
                    : "Seleccionar categoría..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar categoría..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                    {mainCategories.map((main) => {
                      const subs = subCategoriesByParent.get(main.id) ?? []
                      return (
                        <CommandGroup key={main.id} heading={main.name}>
                          <CommandItem
                            value={main.name}
                            onSelect={() => {
                              update("categoryId", main.id === form.categoryId ? null : main.id)
                              setOpenCategory(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.categoryId === main.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {main.name}
                          </CommandItem>
                          {subs.map((sub) => (
                            <CommandItem
                              key={sub.id}
                              value={`${main.name} ${sub.name}`}
                              onSelect={() => {
                                update("categoryId", sub.id === form.categoryId ? null : sub.id)
                                setOpenCategory(false)
                              }}
                              className="pl-8"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.categoryId === sub.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {sub.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter className="sm:col-span-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" disabled={saving}>
              {saving ? (
                <><Loader2 className="size-4 animate-spin mr-2" /> Guardando…</>
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

export default AddItemModal