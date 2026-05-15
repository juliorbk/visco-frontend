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
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/lib/services/categories"
import type { Category } from "@/lib/types"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function CategoryManagerModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchCategories(0, 100)
      setCategories(res.content ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar categorías")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await createCategory({ name: newName.trim() })
      toast.success(`Categoría "${newName}" creada`)
      setNewName("")
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear categoría")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      await updateCategory(id, { name: editName.trim() })
      toast.success("Categoría actualizada")
      setEditingId(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar categoría "${name}"?`)) return
    try {
      await deleteCategory(id)
      toast.success(`Categoría "${name}" eliminada`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Gestionar Categorías</DialogTitle>
          <DialogDescription>
            Administra las categorías de productos del catálogo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Nombre de nueva categoría"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button
            size="sm"
            className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white shrink-0"
            onClick={handleCreate}
            disabled={saving || !newName.trim()}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center"><Loader2 className="size-5 animate-spin mx-auto" /></div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin categorías aún.</p>
          ) : (
            categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                {editingId === c.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(c.id)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button size="sm" variant="outline" onClick={() => handleUpdate(c.id)} disabled={saving}>
                      OK
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>X</Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium">{c.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingId(c.id); setEditName(c.name) }}
                        className="size-7 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
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
