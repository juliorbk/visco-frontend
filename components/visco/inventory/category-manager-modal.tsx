"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/lib/services/categories"
import type { Category } from "@/lib/types"
import { Loader2, Plus, Pencil, Trash2, FolderOpen, ChevronRight } from "lucide-react"
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
  const [newParentId, setNewParentId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editParentId, setEditParentId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchCategories(0, 200)
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

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await createCategory({ name: newName.trim(), parentId: newParentId })
      toast.success(`Categoría "${newName}" creada`)
      setNewName("")
      setNewParentId(null)
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
      await updateCategory(id, { name: editName.trim(), parentId: editParentId })
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
    const hasChildren = categories.some((c) => c.parentId === id)
    if (hasChildren) {
      toast.error("No se puede eliminar una categoría que tiene subcategorías")
      return
    }
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Gestionar Categorías</DialogTitle>
          <DialogDescription>
            Categorías principales y subcategorías del catálogo.
          </DialogDescription>
        </DialogHeader>

        {/* Create form */}
        <div className="space-y-3 p-3 rounded-lg border border-border bg-[#fafafa]">
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
          <Select
            value={newParentId === null ? "none" : String(newParentId)}
            onValueChange={(v) => setNewParentId(v === "none" ? null : Number(v))}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Sin categoría padre (principal)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin categoría padre (principal)</SelectItem>
              {mainCategories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category tree */}
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center"><Loader2 className="size-5 animate-spin mx-auto" /></div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin categorías aún.</p>
          ) : (
            mainCategories.map((main) => {
              const subs = subCategoriesByParent.get(main.id) ?? []
              return (
                <div key={main.id} className="space-y-1">
                  {/* Main category */}
                  <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 bg-[#fafafa]">
                    {editingId === main.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleUpdate(main.id)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button size="sm" variant="outline" onClick={() => handleUpdate(main.id)} disabled={saving}>
                          OK
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>X</Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="size-4 text-[#7b1a1a]" />
                          <span className="text-sm font-semibold">{main.name}</span>
                          {subs.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">({subs.length})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingId(main.id); setEditName(main.name); setEditParentId(null) }}
                            className="size-7 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(main.id, main.name)}
                            className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Subcategories */}
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 ml-6"
                    >
                      {editingId === sub.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUpdate(sub.id)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button size="sm" variant="outline" onClick={() => handleUpdate(sub.id)} disabled={saving}>
                            OK
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>X</Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <ChevronRight className="size-3 text-muted-foreground" />
                            <span className="text-sm">{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditingId(sub.id); setEditName(sub.name); setEditParentId(sub.parentId) }}
                              className="size-7 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id, sub.name)}
                              className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )
            })
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
