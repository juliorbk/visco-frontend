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
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  getCategoryIcon,
  getCategoryColorHex,
  DEFAULT_CATEGORY_COLOR,
} from "@/lib/config/supplier-category-icons"
import {
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function SupplierCategoryManagerModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [categories, setCategories] = useState<SupplierCategoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [icon, setIcon] = useState("")
  const [color, setColor] = useState("")
  const [editIcon, setEditIcon] = useState("")
  const [editColor, setEditColor] = useState("")

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchSupplierCategories(0, 200)
      setCategories(res.content ?? [])
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error loading categories",
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
    setIcon("")
    setColor("")
  }

  const startEdit = (cat: SupplierCategoryDTO) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditDescription(cat.description ?? "")
    setEditIcon(cat.icon ?? "")
    setEditColor(cat.color ?? "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditDescription("")
    setEditIcon("")
    setEditColor("")
  }

  const handleCreate = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      await createSupplierCategory({
        name: trimmed,
        description: description.trim() || undefined,
        icon: icon || undefined,
        color: color || undefined,
      })
      toast.success(`Category "${trimmed}" created`)
      resetCreate()
      load()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error creating category",
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
      await updateSupplierCategory(id, {
        name: trimmed,
        description: editDescription.trim() || undefined,
        icon: editIcon || undefined,
        color: editColor || undefined,
      })
      toast.success("Category updated")
      cancelEdit()
      load()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error updating category",
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (cat: SupplierCategoryDTO) => {
    if (!confirm(`Deactivate category "${cat.name}"?`)) return
    try {
      await deactivateSupplierCategory(cat.id)
      toast.success(`Category "${cat.name}" deactivated`)
      load()
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Error deactivating category",
      )
    }
  }

  const handleActivate = async (cat: SupplierCategoryDTO) => {
    try {
      await activateSupplierCategory(cat.id)
      toast.success(`Category "${cat.name}" activated`)
      load()
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Error activating category",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Manage supplier categories</DialogTitle>
          <DialogDescription>
            Group suppliers by category to organize your catalog and filter the list.
          </DialogDescription>
        </DialogHeader>

        {/* Create form */}
        <div className="space-y-3 p-3 rounded-lg border border-border bg-[#fafafa]">
          <div className="space-y-1.5">
            <Label htmlFor="new-category-name" className="text-xs">
              New category name
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="new-category-name"
                placeholder="e.g. Logistics, Raw materials, IT services"
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
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="new-category-desc"
              rows={2}
              placeholder="Short description of what this category covers"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Icon</Label>
            <div className="flex gap-1 flex-wrap">
              {CATEGORY_ICONS.map((opt) => {
                const IconComp = opt.icon
                const selected = icon === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    title={opt.label}
                    onClick={() => setIcon(selected ? "" : opt.key)}
                    className={cn(
                      "size-8 grid place-items-center rounded-md border transition-colors",
                      selected
                        ? "border-[#7b1a1a] bg-[#fde8e8] text-[#7b1a1a]"
                        : "border-border hover:border-[#7b1a1a]/40 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <IconComp className="size-4" />
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORY_COLORS.map((opt) => {
                const selected = color === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    title={opt.label}
                    onClick={() => setColor(selected ? "" : opt.key)}
                    className={cn(
                      "size-7 rounded-full border-2 transition-all",
                      selected ? "border-[#7b1a1a] scale-110" : "border-transparent hover:scale-105",
                    )}
                    style={{ backgroundColor: opt.value }}
                  />
                )
              })}
            </div>
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
              No categories yet.
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
                      Save
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
                    placeholder="Description (optional)"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-sm"
                    disabled={saving}
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs">Icon</Label>
                    <div className="flex gap-1 flex-wrap">
                      {CATEGORY_ICONS.map((opt) => {
                        const IconComp = opt.icon
                        const selected = editIcon === opt.key
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            title={opt.label}
                            onClick={() => setEditIcon(selected ? "" : opt.key)}
                            className={cn(
                              "size-8 grid place-items-center rounded-md border transition-colors",
                              selected
                                ? "border-[#7b1a1a] bg-[#fde8e8] text-[#7b1a1a]"
                                : "border-border hover:border-[#7b1a1a]/40 text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <IconComp className="size-4" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Color</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {CATEGORY_COLORS.map((opt) => {
                        const selected = editColor === opt.key
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            title={opt.label}
                            onClick={() => setEditColor(selected ? "" : opt.key)}
                            className={cn(
                              "size-7 rounded-full border-2 transition-all",
                              selected ? "border-[#7b1a1a] scale-110" : "border-transparent hover:scale-105",
                            )}
                            style={{ backgroundColor: opt.value }}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={cat.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const CatIcon = getCategoryIcon(cat.icon)
                        const catColor = getCategoryColorHex(cat.color)
                        return (
                          <CatIcon className="size-4 shrink-0" style={{ color: catColor }} />
                        )
                      })()}
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
                        {cat.active ? "ACTIVE" : "INACTIVE"}
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
                      title="Edit"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    {cat.active ? (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(cat)}
                        className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        title="Deactivate"
                      >
                        <NoSymbolIcon className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(cat)}
                        className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                        title="Activate"
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
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
