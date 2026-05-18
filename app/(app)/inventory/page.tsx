"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Filter, Plus, Search, Loader2, Tags, ChevronLeft, ChevronRight } from "lucide-react"
import { fetchProducts } from "@/lib/services/inventory"
import type { ProductDTO } from "@/lib/types"
import { InventoryStatusBadge } from "@/components/visco/status-badge"
import { ItemDetailPanel } from "@/components/visco/inventory/item-detail-panel"
import { AddItemModal } from "@/components/visco/inventory/add-item-modal"
import { CategoryManagerModal } from "@/components/visco/inventory/category-manager-modal"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [selected, setSelected] = useState<ProductDTO | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<ProductDTO | null>(null)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)

  // Estados de paginación
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchProducts(page, 20)
      setProducts(res.content ?? [])
      setTotalPages(res.page.totalPages)
      setTotalElements(res.page.totalElements)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  // Nota: Este filtrado aplicará únicamente sobre los elementos de la página actual.
  // Para un filtrado global, deberías enviar el `search` y `category` a la API en la función load().
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      const matchesCat = category === "all" || (p.categoryName?.toLowerCase() === category.toLowerCase())
      return matchesSearch && matchesCat
    })
  }, [products, search, category])

  const computeStatus = (p: ProductDTO) => {
    if (p.totalStock <= 0) return "Sin stock"
    if (p.totalStock < p.reorderPoint) return "Bajo stock"
    return "En stock"
  }

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        subtitle="Gestiona productos, niveles de stock y puntos de reorden en todos los almacenes."
        actions={
          <>
            <Button variant="outline" size="sm" className="bg-card">
              <Filter className="size-4 mr-2" /> Filters
            </Button>
            <Button variant="outline" size="sm" className="bg-card">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-card"
              onClick={() => setCategoryManagerOpen(true)}
            >
              <Tags className="size-4 mr-2" /> Categories
            </Button>
            <Button
              size="sm"
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => {
                setEditing(null)
                setAddOpen(true)
              }}
            >
              <Plus className="size-4 mr-2" /> Add Item
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU…"
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
                <th className="text-left font-medium px-5 py-3">Código</th>
                <th className="text-left font-medium px-5 py-3">Item Name</th>
                <th className="text-left font-medium px-5 py-3">Category</th>
                <th className="text-left font-medium px-5 py-3">SKU</th>
                <th className="text-left font-medium px-5 py-3">Stock</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    <Loader2 className="size-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No hay productos que coincidan con tu búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={cn(
                      "border-t border-border cursor-pointer transition-colors",
                      selected?.id === p.id ? "bg-[#fde8e8]/60" : "hover:bg-[#fafafa]",
                    )}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.internalCode}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.categoryName ?? "-"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                    <td className="px-5 py-3 tabular-nums">
                      {p.totalStock}{" "}
                      <span className="text-xs text-muted-foreground">{p.uom.toLowerCase()}</span>
                    </td>
                    <td className="px-5 py-3">
                      <InventoryStatusBadge status={computeStatus(p)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-[#fafafa]">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="text-muted-foreground"
            >
              <ChevronLeft className="size-4 mr-1" /> Anterior
            </Button>
            
            <span className="text-sm font-medium text-muted-foreground">
              Página {page + 1} de {totalPages} · {totalElements} productos
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage((p) => p + 1)}
              className="text-muted-foreground"
            >
              Siguiente <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <ItemDetailPanel
        product={selected}
        onClose={() => setSelected(null)}
        onEdit={(p) => {
          setEditing(p)
          setAddOpen(true)
        }}
      />

      <AddItemModal
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o)
          if (!o) setEditing(null)
        }}
        editing={editing}
        onSave={() => load()}
      />

      <CategoryManagerModal
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
      />
    </div>
  )
}