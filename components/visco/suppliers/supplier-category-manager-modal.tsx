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
import { Textarea } from "@/components/ui/textarea"
import {
  createSupplierCategory,
  updateSupplierCategory,
  deactivateSupplierCategory,
  activateSupplierCategory,
  fetchSupplierCategories,
} from "@/lib/services/suppliers"
import type { SupplierCategoryDTO } from "@/lib/types"
import {
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  XMarkIcon,
  TagIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

export function SupplierCategoryManagerModal({
  open,
  onOpenChange,
  onCategoriesChanged,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCategoriesChanged?: (cats: SupplierCategoryDTO[]) => void
}) {
  const [categories, setCategories] = useState<SupplierCategoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchSupplierCategories(0, 200)
      setCategories(res.content ?? [])
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al cargar categorias",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const resetCreate = () => {
    setName("")
    setDescription("")
  }

  const startEdit = (cat: SupplierCategoryDTO) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditDescription(cat.description ?? "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditDescription("")
  }

  const handleCreate = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      const created = await createSupplierCategory({
        name: trimmed,
        description: description.trim() || undefined,
      })
      toast.success(`Categoria "${trimmed}" creada`)
      resetCreate()
      setCategories((prev) => {
        const next = [...prev, created]
        onCategoriesChanged?.(next)
        return next
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al crear categoria",
      )
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: number) => {
    const trimmed = editName.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      const updated = await updateSupplierCategory(id, {
        name: trimmed,
        description: editDescription.trim() || undefined,
      })
      toast.success("Categoria actualizada")
      cancelEdit()
      setCategories((prev) => {
        const next = prev.map((c) => (c.id === id ? updated : c))
        onCategoriesChanged?.(next)
        return next
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al actualizar categoria",
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (cat: SupplierCategoryDTO) => {
    if (!confirm(`Desactivar categoria "${cat.name}"?`)) return
    try {
      await deactivateSupplierCategory(cat.id)
      toast.success(`Categoria "${cat.name}" desactivada`)
      setCategories((prev) => {
        const next = prev.map((c) => (c.id === cat.id ? { ...c, active: false } : c))
        onCategoriesChanged?.(next)
        return next
      })
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Error al desactivar categoria",
      )
    }
  }

  const handleActivate = async (cat: SupplierCategoryDTO) => {
    try {
      await activateSupplierCategory(cat.id)
      toast.success(`Categoria "${cat.name}" activada`)
      setCategories((prev) => {
        const next = prev.map((c) => (c.id === cat.id ? { ...c, active: true } : c))
        onCategoriesChanged?.(next)
        return next
      })
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Error al activar categoria",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Gestionar categorias de proveedores</DialogTitle>
          <DialogDescription>
            Agrupa proveedores por categoria para organizar tu catalogo y filtrar la lista.
          </DialogDescription>
        </DialogHeader>

        {/* Create form */}
        <div className="space-y-3 p-3 rounded-lg border border-border bg-[#fafafa]">
          <div className="space-y-1.5">
            <Label htmlFor="new-category-name" className="text-xs">
              Nombre de nueva categoria
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="new-category-name"
                placeholder="ej. Logistica, Materias primas, Servicios TI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                disabled={saving}
              />
              <Button
                size="sm"
                className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white shrink-0"
                onClick={handleCreate}
                disabled={saving || !name.trim()}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-category-desc" className="text-xs">
              Descripcion <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="new-category-desc"
              rows={2}
              placeholder="Breve descripcion de lo que cubre esta categoria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        {/* Category list */}
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center">
              <ArrowPathIcon className="size-5 animate-spin mx-auto" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay categorias aun.
            </p>
          ) : (
            categories.map((cat) =>
              editingId === cat.id ? (
                <div
                  key={cat.id}
                  className="space-y-2 p-3 rounded-md border border-border bg-[#fafafa]"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdate(cat.id)
                      }
                      className="h-8 text-sm"
                      autoFocus
                      disabled={saving}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdate(cat.id)}
                      disabled={saving}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      <XMarkIcon className="size-4" />
                    </Button>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Descripcion (opcional)"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-sm"
                    disabled={saving}
                  />
                </div>
              ) : (
                <div
                  key={cat.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <TagIcon className="size-4 text-[#7b1a1a] shrink-0" />
                      <span className="text-sm font-semibold truncate">
                        {cat.name}
                      </span>
                      <span
                        className={
                          cat.active
                            ? "inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-medium shrink-0"
                            : "inline-flex items-center rounded-full bg-gray-200 text-gray-600 px-2 py-0.5 text-[10px] font-medium shrink-0"
                        }
                      >
                        {cat.active ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 ml-6 break-words">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="size-7 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
                      title="Editar"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    {cat.active ? (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(cat)}
                        className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        title="Desactivar"
                      >
                        <NoSymbolIcon className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(cat)}
                        className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                        title="Activar"
                      >
                        <CheckCircleIcon className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ),
            )
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
